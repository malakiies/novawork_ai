const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Toutes les routes analytics sont privées et pour les Admins (God Mode)
router.use(protect);
router.use(requireAdmin);

router.get('/dashboard', analyticsController.getAdminDashboardStats);

module.exports = router;
