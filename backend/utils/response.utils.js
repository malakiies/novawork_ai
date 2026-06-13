/**
 * ApiResponse — Réponse succès standardisée
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Succès', meta = null) {
    this.success    = true;
    this.statusCode = statusCode;
    this.message    = message;
    this.data       = data;
    if (meta) this.meta = meta;
  }
}

/**
 * ApiError — Erreur HTTP standardisée (extends Error)
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = '') {
    super(message);
    this.success    = false;
    this.statusCode = statusCode;
    this.errors     = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Helpers statiques pour les erreurs courantes
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = 'Non authentifié') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, message);
  }
  static conflict(message) {
    return new ApiError(409, message);
  }
  static tooMany(message = 'Trop de requêtes') {
    return new ApiError(429, message);
  }
  static internal(message = 'Erreur interne du serveur') {
    return new ApiError(500, message);
  }
}

/**
 * sendSuccess — Raccourci pour envoyer une réponse succès
 */
const sendSuccess = (res, data, message = 'Succès', statusCode = 200, meta = null) => {
  const response = new ApiResponse(statusCode, data, message, meta);
  return res.status(statusCode).json(response);
};

/**
 * sendError — Raccourci pour envoyer une erreur
 */
const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({
    success:    false,
    statusCode,
    message,
    errors,
  });
};

module.exports = { ApiResponse, ApiError, sendSuccess, sendError };
