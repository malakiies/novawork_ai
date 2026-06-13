const express = require('express');
const router = express.Router();

const cvController = require('../controllers/cv.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireCandidate } = require('../middleware/role.middleware');
const { uploadCV } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimit.middleware');

// Toutes les routes CV sont privées et réservées aux candidats
router.use(protect);
router.use(requireCandidate);

router.post('/upload', uploadLimiter, uploadCV, cvController.uploadCV);
router.get('/my-cvs', cvController.getMyCVs);
router.post('/:id/analyze', cvController.analyzeCV);
router.put('/:id/primary', cvController.setPrimaryCV);
router.delete('/:id', cvController.deleteCV);

module.exports = router;
