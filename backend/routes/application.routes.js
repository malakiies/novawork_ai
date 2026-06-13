const express = require('express');
const router = express.Router();

const applicationController = require('../controllers/application.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireCompany } = require('../middleware/role.middleware');

router.use(protect);

// Routes pour l'entreprise
router.get('/company/board', requireCompany, applicationController.getCompanyBoard);
router.put('/:id/status', requireCompany, applicationController.updateStatus);

module.exports = router;
