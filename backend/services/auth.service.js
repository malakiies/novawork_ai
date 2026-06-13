const crypto = require('crypto');
const User   = require('../models/User.model');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt.utils');
const { ApiError }   = require('../utils/response.utils');
const emailService   = require('./email.service');
const logger         = require('../utils/logger');

/**
 * registerUser — Crée un compte candidat ou entreprise
 */
const registerUser = async ({ email, password, role, firstName, lastName, companyName }) => {
  // Vérifier si l'email existe déjà
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('Cet email est déjà utilisé');

  // Créer l'utilisateur
  const user = await User.create({
    email,
    password,
    role,
    firstName,
    lastName,
    isEmailVerified: false,
  });

  // Créer le profil associé
  if (role === 'candidate') {
    const CandidateProfile = require('../models/CandidateProfile.model');
    await CandidateProfile.create({
      userId: user._id,
      firstName,
      lastName,
    });
  } else if (role === 'company') {
    const Company = require('../models/Company.model');
    await Company.create({
      userId: user._id,
      companyName,
    });
  }

  // Générer le token de vérification email
  const verificationToken  = crypto.randomBytes(32).toString('hex');
  const hashedToken        = crypto.createHash('sha256').update(verificationToken).digest('hex');

  user.emailVerificationToken   = hashedToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  await user.save({ validateBeforeSave: false });

  // Envoyer email de vérification
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await emailService.sendVerificationEmail(user.email, user.firstName || companyName, verifyUrl);

  logger.info(`Nouvel utilisateur enregistré : ${email} (${role})`);

  return user.toSafeJSON();
};

/**
 * loginUser — Authentification + génération de tokens
 */
const loginUser = async ({ email, password, ip }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Email ou mot de passe incorrect');
  }
  if (!user.isEmailVerified) {
    throw ApiError.forbidden('Veuillez vérifier votre email avant de vous connecter');
  }
  if (!user.isActive || user.isBanned) {
    throw ApiError.forbidden('Compte désactivé');
  }

  const { accessToken, refreshToken } = generateTokenPair(user);

  // Mettre à jour le refresh token et les infos de connexion
  user.refreshToken = refreshToken;
  user.lastLogin    = new Date();
  user.loginCount   = (user.loginCount || 0) + 1;
  user.lastLoginIp  = ip;
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeJSON(), accessToken, refreshToken };
};

/**
 * refreshAccessToken — Renouvelle l'access token depuis le refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token manquant');

  const decoded = verifyRefreshToken(refreshToken);
  const user    = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Refresh token invalide ou révoqué');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

/**
 * logoutUser — Révoque le refresh token
 */
const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

/**
 * verifyEmail — Vérifie le token d'email
 */
const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken:   hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) throw ApiError.badRequest('Token invalide ou expiré');

  user.isEmailVerified        = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return user.toSafeJSON();
};

/**
 * forgotPassword — Envoie un email de reset
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  // Toujours répondre 200 pour ne pas révéler si l'email existe
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.passwordResetToken   = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail(user.email, user.firstName, resetUrl);
};

/**
 * resetPassword — Réinitialise le mot de passe
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw ApiError.badRequest('Token invalide ou expiré');

  user.password             = newPassword;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken         = null; // Invalider toutes les sessions
  await user.save();

  return user.toSafeJSON();
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
