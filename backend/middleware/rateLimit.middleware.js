const rateLimit = require('express-rate-limit');
const { ApiError } = require('../utils/response.utils');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders:   false,
    handler: (req, res, next, options) => {
      next(ApiError.tooMany(message));
    },
  });

// ─── Limiteurs par contexte ───────────────────────────────────────────────────

// Auth : 10 tentatives / 15 min (anti-brute force)
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
);

// API globale : 100 req / min
const apiLimiter = createLimiter(
  60 * 1000,
  100,
  'Trop de requêtes. Veuillez patienter une minute.'
);

// Upload : 5 fichiers / 10 min
const uploadLimiter = createLimiter(
  10 * 60 * 1000,
  5,
  'Trop d\'uploads. Attendez 10 minutes.'
);

// IA : 20 appels / 10 min (coûteux)
const aiLimiter = createLimiter(
  10 * 60 * 1000,
  20,
  'Limite d\'appels IA atteinte. Attendez 10 minutes.'
);

// Stripe Checkout : 5 sessions / 30 min
const stripeLimiter = createLimiter(
  30 * 60 * 1000,
  5,
  'Trop de tentatives de paiement.'
);

module.exports = { authLimiter, apiLimiter, uploadLimiter, aiLimiter, stripeLimiter };
