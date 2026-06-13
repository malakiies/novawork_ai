const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response.utils');
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/jwt.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Inscription (Candidat / Entreprise)
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  
  return sendSuccess(
    res, 
    { user }, 
    'Inscription réussie. Veuillez vérifier votre email.', 
    201
  );
});

/**
 * @desc    Connexion
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  const { user, accessToken, refreshToken } = await authService.loginUser({ email, password, ip });

  // Placer le refresh token dans un cookie httpOnly sécurisé
  setRefreshTokenCookie(res, refreshToken);

  return sendSuccess(res, { user, accessToken }, 'Connexion réussie');
});

/**
 * @desc    Renouveler l'Access Token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (utilise le cookie)
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Le refreshToken vient des cookies
  const token = req.cookies?.refreshToken;
  
  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token);

  // Mettre à jour le cookie
  setRefreshTokenCookie(res, newRefreshToken);

  return sendSuccess(res, { accessToken }, 'Token renouvelé');
});

/**
 * @desc    Déconnexion
 * @route   POST /api/v1/auth/logout
 * @access  Privé
 */
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await authService.logoutUser(req.user._id);
  }
  
  clearRefreshTokenCookie(res);
  
  return sendSuccess(res, null, 'Déconnexion réussie');
});

/**
 * @desc    Vérifier l'email via le token
 * @route   GET /api/v1/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await authService.verifyEmail(token);
  
  return sendSuccess(res, { user }, 'Email vérifié avec succès');
});

/**
 * @desc    Demander la réinitialisation du mot de passe
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  
  // Toujours renvoyer un succès pour ne pas révéler les adresses existantes
  return sendSuccess(res, null, 'Si un compte correspond, un email a été envoyé');
});

/**
 * @desc    Réinitialiser le mot de passe via token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  const user = await authService.resetPassword(token, password);
  
  return sendSuccess(res, { user }, 'Mot de passe réinitialisé avec succès');
});

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/v1/auth/me
 * @access  Privé
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, { user: req.user.toSafeJSON() });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};
