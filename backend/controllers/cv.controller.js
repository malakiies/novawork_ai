const CV = require('../models/CV.model');
const AIAnalysis = require('../models/AIAnalysis.model');
const cvService = require('../services/cv.service');
const aiService = require('../services/ai.service');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');
const { io } = require('../sockets/socket.manager'); // si on veut emettre direct
const { emitToUser } = require('../sockets/socket.manager');
const { NOTIFICATION_TYPES } = require('../config/constants');

/**
 * @desc    Upload un nouveau CV
 * @route   POST /api/v1/cv/upload
 * @access  Privé (Candidate)
 */
const uploadCV = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Aucun fichier fourni');
  }

  // Vérifier la limite de 5 CVs (faite aussi dans le modèle mais on évite l'upload Cloudinary pour rien)
  const count = await CV.countDocuments({ userId: req.user._id });
  if (count >= 5) {
    throw ApiError.badRequest('Vous avez atteint la limite de 5 CVs. Supprimez-en un pour continuer.');
  }

  // 1. Upload vers Cloudinary
  const { url, publicId } = await cvService.uploadCVToCloudinary(req.file.buffer, req.file.originalname);

  // 2. Extraire le texte brut (en background ou de suite, ici on attend pour la V1)
  const rawText = await cvService.extractTextFromBuffer(req.file.buffer, req.file.mimetype);

  // 3. Sauvegarder en BDD
  const cv = await CV.create({
    userId: req.user._id,
    fileName: req.file.originalname,
    fileUrl: url,
    cloudinaryPublicId: publicId,
    fileType: req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx',
    fileSize: req.file.size,
    rawText: rawText, // caché par default dans les queries via select: false
    isPrimary: count === 0, // Si 1er CV, il est principal par défaut
  });

  return sendSuccess(res, { cv }, 'CV uploadé avec succès', 201);
});

/**
 * @desc    Déclencher l'analyse IA d'un CV
 * @route   POST /api/v1/cv/:id/analyze
 * @access  Privé (Candidate propriétaire)
 */
const analyzeCV = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id }).select('+rawText');
  
  if (!cv) throw ApiError.notFound('CV introuvable');
  if (!cv.rawText) throw ApiError.badRequest('Impossible d\'analyser: aucun texte extrait de ce CV');

  // Pour ne pas bloquer la requête HTTP longue, on gère l'IA en background
  // Et on répond immédiatement au client
  
  res.status(202).json({
    success: true,
    message: 'L\'analyse IA est en cours. Vous serez notifié à la fin.',
  });

  // --- TRAITEMENT BACKGROUND ---
  try {
    // 1. Appel GPT-4o
    const { parsedData, modelUsed } = await aiService.analyzeCV(cv.rawText);
    
    // 2. Générer l'embedding
    const textToEmbed = `${parsedData.extractedData.summary} ${parsedData.extractedData.skills?.all?.join(' ')} ${parsedData.extractedData.experience?.map(e => e.description).join(' ')}`;
    const embedding = await aiService.generateEmbedding(textToEmbed);

    // 3. Sauvegarder l'analyse
    const analysis = await AIAnalysis.create({
      cvId: cv._id,
      userId: req.user._id,
      extractedData: parsedData.extractedData,
      scores: parsedData.scores,
      strengths: parsedData.strengths,
      weaknesses: parsedData.weaknesses,
      suggestions: parsedData.suggestions,
      embedding: embedding,
      modelUsed: modelUsed,
      status: 'completed',
      analyzedAt: new Date()
    });

    // 4. Lier l'analyse au CV
    cv.isAnalyzed = true;
    cv.analysisId = analysis._id;
    await cv.save();

    // 5. Mettre à jour les skills du profil candidat
    // (A faire quand on créera le contrôleur Candidate)

    // 6. Envoyer notification Socket.io
    emitToUser(req.user._id, 'notification', {
      type: NOTIFICATION_TYPES.CV_ANALYSIS_DONE,
      title: 'Analyse de CV terminée',
      body: `Les résultats d'analyse pour ${cv.fileName} sont disponibles !`,
      metadata: { cvId: cv._id }
    });

  } catch (err) {
    console.error('Erreur Analyse Background:', err);
    emitToUser(req.user._id, 'notification', {
      type: NOTIFICATION_TYPES.SYSTEM,
      title: 'Échec de l\'analyse',
      body: `Nous n'avons pas pu analyser ${cv.fileName}. Veuillez réessayer.`,
      priority: 'high'
    });
  }
});

/**
 * @desc    Lister mes CVs
 * @route   GET /api/v1/cv/my-cvs
 * @access  Privé (Candidate)
 */
const getMyCVs = asyncHandler(async (req, res) => {
  const cvs = await CV.find({ userId: req.user._id })
    .sort('-createdAt')
    .populate('analysisId', 'scores.overall status'); // Afficher juste qq champs de l'analyse
    
  return sendSuccess(res, { cvs });
});

/**
 * @desc    Définir comme CV principal
 * @route   PUT /api/v1/cv/:id/primary
 * @access  Privé (Candidate propriétaire)
 */
const setPrimaryCV = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) throw ApiError.notFound('CV introuvable');

  cv.isPrimary = true;
  await cv.save(); // Le middleware Mongoose s'occupe de mettre les autres à false

  return sendSuccess(res, { cv }, 'CV défini comme principal');
});

/**
 * @desc    Supprimer un CV
 * @route   DELETE /api/v1/cv/:id
 * @access  Privé (Candidate propriétaire)
 */
const deleteCV = asyncHandler(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id }).select('+cloudinaryPublicId');
  if (!cv) throw ApiError.notFound('CV introuvable');

  // 1. Supprimer de Cloudinary
  await cvService.deleteFromCloudinary(cv.cloudinaryPublicId);

  // 2. Supprimer l'analyse associée (si elle existe)
  if (cv.analysisId) {
    await AIAnalysis.findByIdAndDelete(cv.analysisId);
  }

  // 3. Supprimer de MongoDB
  await cv.deleteOne();

  return sendSuccess(res, null, 'CV supprimé avec succès');
});

module.exports = {
  uploadCV,
  analyzeCV,
  getMyCVs,
  setPrimaryCV,
  deleteCV,
};
