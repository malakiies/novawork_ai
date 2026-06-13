const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { protect }    = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// Routes publiques
router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Routes privées
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
