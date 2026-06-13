/**
 * asyncHandler — Wrapper qui capture les erreurs async/await
 * et les passe au middleware d'erreur global (next(err)).
 *
 * Usage: router.get('/route', asyncHandler(async (req, res, next) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
