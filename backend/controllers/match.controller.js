const Job = require('../models/Job.model');
const CV = require('../models/CV.model');
const AIAnalysis = require('../models/AIAnalysis.model');
const aiService = require('../services/ai.service');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Générer un matching intelligent "à la volée" entre un Job et un CV
 * @route   POST /api/v1/jobs/:jobId/match/:cvId
 * @access  Privé (Company ou Admin)
 */
const generateMatch = asyncHandler(async (req, res) => {
  const { jobId, cvId } = req.params;

  // 1. Récupérer le Job
  const job = await Job.findById(jobId).lean();
  if (!job) throw ApiError.notFound('Offre d\'emploi introuvable');

  // 2. Récupérer le CV et son AIAnalysis
  const cv = await CV.findById(cvId).lean();
  if (!cv) throw ApiError.notFound('CV introuvable');
  
  if (!cv.isAnalyzed || !cv.analysisId) {
    throw ApiError.badRequest('Ce CV n\'a pas encore été analysé par l\'IA.');
  }

  const analysis = await AIAnalysis.findById(cv.analysisId).lean();
  if (!analysis) throw ApiError.notFound('Données d\'analyse IA introuvables pour ce CV');

  // 3. Formater les données pour le prompt (ne garder que l'essentiel pour économiser des tokens)
  const jobContext = {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    skills: job.skills,
    experienceLevel: job.experienceLevel,
    educationLevel: job.educationLevel,
    category: job.category
  };

  const cvContext = {
    summary: analysis.extractedData.summary,
    skills: analysis.extractedData.skills,
    experience: analysis.extractedData.experience,
    education: analysis.extractedData.education,
    totalExperienceYears: analysis.extractedData.totalExperienceYears,
    seniorityLevel: analysis.extractedData.seniorityLevel
  };

  // 4. Lancer le moteur de matching OpenAI
  const { matchData } = await aiService.matchCandidateToJob(cvContext, jobContext);

  // 5. Retourner le résultat à la volée (le client frontend pourra l'afficher)
  return sendSuccess(res, { 
    jobId, 
    cvId,
    candidateName: analysis.extractedData.fullName,
    match: matchData 
  }, 'Matching IA généré avec succès');
});

module.exports = {
  generateMatch,
};
