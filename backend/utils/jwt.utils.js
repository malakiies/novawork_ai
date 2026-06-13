const jwt = require('jsonwebtoken');
const { ApiError } = require('./response.utils');

/**
 * Génère un Access Token (courte durée)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    issuer:    'novawork-api',
    audience:  'novawork-client',
  });
};

/**
 * Génère un Refresh Token (longue durée)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    issuer:    'novawork-api',
    audience:  'novawork-client',
  });
};

/**
 * Vérifie et décode un Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer:   'novawork-api',
      audience: 'novawork-client',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expiré, veuillez vous reconnecter');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Token invalide');
    }
    throw ApiError.unauthorized('Erreur de vérification du token');
  }
};

/**
 * Vérifie et décode un Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer:   'novawork-api',
      audience: 'novawork-client',
    });
  } catch (error) {
    throw ApiError.unauthorized('Refresh token invalide ou expiré');
  }
};

/**
 * Génère la paire Access + Refresh Token
 */
const generateTokenPair = (user) => {
  const payload = {
    id:   user._id.toString(),
    role: user.role,
  };
  return {
    accessToken:  generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Configure le cookie httpOnly pour le refresh token
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 jours
    path:     '/',
  });
};

/**
 * Efface le cookie refresh token
 */
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    path:     '/',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
