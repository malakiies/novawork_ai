const express = require('express');
const router = express.Router();

const coverLetterController = require('../controllers/coverLetter.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireCandidate } = require('../middleware/role.middleware');

// Toutes les routes CoverLetter sont privées et réservées aux candidats
router.use(protect);
router.use(requireCandidate);

router.post('/generate', coverLetterController.generateLetter);
router.post('/:id/export-pdf', coverLetterController.exportPDF);
router.get('/', coverLetterController.getMyLetters);

module.exports = router;
