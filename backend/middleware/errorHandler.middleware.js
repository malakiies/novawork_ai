const logger = require('../utils/logger');
const { ApiError } = require('../utils/response.utils');

/**
 * errorHandler — Middleware global de gestion d'erreurs Express.
 * Doit être enregistré EN DERNIER dans app.js (après toutes les routes).
 *
 * Gère :
 * - ApiError (nos erreurs métier)
 * - Erreurs Mongoose (validation, cast, duplicate)
 * - Erreurs JWT
 * - Erreurs Multer (upload)
 * - Erreurs Stripe
 * - Erreurs inattendues
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message    = err.message;
  error.statusCode = err.statusCode || 500;

  // ─── Log ────────────────────────────────────────────────────────────────────
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} → ${error.statusCode} : ${error.message}`, {
      stack: err.stack,
      body:  req.body,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${error.statusCode} : ${error.message}`);
  }

  // ─── Mongoose : CastError (ID invalide) ─────────────────────────────────────
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`ID invalide : ${err.value}`);
  }

  // ─── Mongoose : Validation Error ────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest('Erreur de validation', messages);
  }

  // ─── Mongoose : Duplicate Key (code 11000) ───────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    error = ApiError.conflict(`La valeur du champ "${field}" existe déjà`);
  }

  // ─── JWT Errors ─────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Token invalide');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expiré');
  }

  // ─── Multer Errors ──────────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = ApiError.badRequest('Fichier trop volumineux');
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = ApiError.badRequest('Champ de fichier inattendu');
  }

  // ─── Réponse finale ─────────────────────────────────────────────────────────
  return res.status(error.statusCode || 500).json({
    success:    false,
    statusCode: error.statusCode || 500,
    message:    error.message || 'Erreur interne du serveur',
    errors:     error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * notFound — Route non trouvée (404)
 */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route introuvable : ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
