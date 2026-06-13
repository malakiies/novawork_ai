const { ApiError } = require('../utils/response.utils');

/**
 * requireRole — Middleware RBAC.
 * Vérifie que l'utilisateur connecté possède l'un des rôles autorisés.
 *
 * Usage:
 *   router.post('/jobs', protect, requireRole('company', 'admin'), createJob)
 *   router.get('/admin', protect, requireRole('admin'), adminDashboard)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Non authentifié'));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(
        `Accès réservé aux rôles : ${roles.join(', ')}. Votre rôle : ${req.user.role}`
      )
    );
  }

  next();
};

/**
 * Raccourcis sémantiques
 */
const requireCandidate = requireRole('candidate');
const requireCompany   = requireRole('company');
const requireAdmin     = requireRole('admin');
const requireCompanyOrAdmin = requireRole('company', 'admin');

module.exports = {
  requireRole,
  requireCandidate,
  requireCompany,
  requireAdmin,
  requireCompanyOrAdmin,
};
