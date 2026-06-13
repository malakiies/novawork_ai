const CoverLetter = require('../models/CoverLetter.model');
const CV = require('../models/CV.model');
const AIAnalysis = require('../models/AIAnalysis.model');
const aiService = require('../services/ai.service');
const pdfService = require('../services/pdf.service');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Générer une lettre de motivation
 * @route   POST /api/v1/cover-letters/generate
 * @access  Privé (Candidate)
 */
const generateLetter = asyncHandler(async (req, res) => {
  const { cvId, jobContext, tone } = req.body;

  if (!cvId || !jobContext) {
    throw ApiError.badRequest('cvId et jobContext sont obligatoires.');
  }

  // 1. Récupérer le CV et son analyse
  const cv = await CV.findOne({ _id: cvId, userId: req.user._id });
  if (!cv || !cv.analysisId) {
    throw ApiError.badRequest('Veuillez sélectionner un CV analysé valide.');
  }

  const analysis = await AIAnalysis.findById(cv.analysisId).lean();
  if (!analysis) {
    throw ApiError.notFound('Données IA introuvables pour ce CV.');
  }

  // 2. Générer le texte via OpenAI
  const content = await aiService.generateCoverLetter(analysis.extractedData, jobContext, tone || 'Professionnel');

  // 3. Sauvegarder dans MongoDB (CoverLetter)
  const coverLetter = await CoverLetter.create({
    userId: req.user._id,
    cvId: cv._id,
    title: `Lettre - ${tone || 'Professionnel'}`,
    content: content,
    generationParams: {
      tone: tone === 'Créatif' ? 'creative' : tone === 'Moderne' ? 'enthusiastic' : 'formal',
      language: 'fr'
    },
    isAIGenerated: true,
    aiVersion: 'gpt-4o'
  });

  return sendSuccess(res, { coverLetter }, 'Lettre générée avec succès', 201);
});

/**
 * @desc    Convertir une lettre en PDF et sauvegarder sur Cloudinary
 * @route   POST /api/v1/cover-letters/:id/export-pdf
 * @access  Privé (Candidate)
 */
const exportPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const letter = await CoverLetter.findOne({ _id: id, userId: req.user._id }).populate('userId', 'firstName lastName');
  if (!letter) throw ApiError.notFound('Lettre de motivation introuvable');

  const candidateName = `${letter.userId.firstName || 'Candidat'} ${letter.userId.lastName || ''}`.trim();

  // Génération PDF et Upload Cloudinary via Stream
  const pdfUrl = await pdfService.generateAndUploadPDF(letter.content, candidateName);

  // Mettre à jour la lettre avec l'URL Cloudinary
  letter.pdfUrl = pdfUrl;
  letter.lastExportedAt = new Date();
  await letter.save();

  return sendSuccess(res, { pdfUrl }, 'PDF généré avec succès');
});

/**
 * @desc    Lister mes lettres de motivation
 * @route   GET /api/v1/cover-letters
 * @access  Privé (Candidate)
 */
const getMyLetters = asyncHandler(async (req, res) => {
  const letters = await CoverLetter.find({ userId: req.user._id }).sort('-createdAt');
  return sendSuccess(res, { letters });
});

module.exports = {
  generateLetter,
  exportPDF,
  getMyLetters
};
