const { verifyAccessToken } = require('../utils/jwt.utils');
const { ApiError }          = require('../utils/response.utils');
const asyncHandler          = require('../utils/asyncHandler');
const User                  = require('../models/User.model');

/**
 * protect — Vérifie le JWT dans le header Authorization.
 * Injecte req.user sur succès.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extraire le token du header Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Aucun token fourni, accès refusé');
  }

  // Vérifier et décoder
  const decoded = verifyAccessToken(token);

  // Vérifier que l'utilisateur existe encore et est actif
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user) {
    throw ApiError.unauthorized('Compte introuvable');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('Compte désactivé, contactez le support');
  }
  if (user.isBanned) {
    throw ApiError.forbidden(`Compte suspendu. Raison : ${user.banReason || 'Violation des conditions d\'utilisation'}`);
  }

  req.user = user;
  next();
});

/**
 * optionalAuth — Essaie de vérifier le JWT sans bloquer si absent.
 * Utile pour les routes publiques qui bénéficient du contexte user.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const user    = await User.findById(decoded.id);
      if (user?.isActive) req.user = user;
    }
  } catch {
    // Silencieux — l'utilisateur reste null
  }
  next();
});

module.exports = { protect, optionalAuth };
