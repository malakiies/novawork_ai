const Job = require('../models/Job.model');
const Application = require('../models/Application.model');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');
const { getPaginationOptions, buildPaginatedResponse } = require('../utils/pagination.utils');
const { generateEmbedding } = require('../services/ai.service');
const { JOB_STATUS } = require('../config/constants');

/**
 * @desc    Créer une nouvelle offre d'emploi
 * @route   POST /api/v1/jobs
 * @access  Privé (Entreprise)
 */
const createJob = asyncHandler(async (req, res) => {
  // L'utilisateur doit avoir un profil entreprise
  // Si le CompanyId n'est pas dans le JWT, on le trouve via le req.user._id
  const company = await require('../models/Company.model').findOne({ userId: req.user._id });
  if (!company) {
    throw ApiError.forbidden('Profil entreprise introuvable. Veuillez compléter votre profil.');
  }

  // Vérifier la limite d'offres du plan
  const activeJobsCount = await Job.countDocuments({ 
    companyId: company._id, 
    status: JOB_STATUS.ACTIVE 
  });
  
  if (activeJobsCount >= company.limits.jobPosts) {
    throw ApiError.forbidden(`Limite d'offres atteinte (${company.limits.jobPosts}). Veuillez upgrader votre abonnement.`);
  }

  const jobData = {
    ...req.body,
    companyId: company._id,
    postedBy: req.user._id,
    status: JOB_STATUS.ACTIVE, // On l'active par défaut, ou DRAFT si spécifié
  };

  // Optionnel : Générer l'embedding IA immédiatement si l'option est active (selon le plan)
  if (company.limits.aiMatching) {
    const textToEmbed = `${jobData.title} ${jobData.description} ${jobData.skills.join(' ')}`;
    try {
      jobData.embedding = await generateEmbedding(textToEmbed);
      jobData.isAIEnhanced = true;
    } catch (error) {
      // On ne bloque pas la création si l'IA échoue
      console.error("Échec de génération d'embedding pour le job:", error);
    }
  }

  const job = await Job.create(jobData);
  
  // Mettre à jour les stats de l'entreprise
  company.stats.totalJobsPosted += 1;
  await company.save({ validateBeforeSave: false });

  return sendSuccess(res, { job }, 'Offre d\'emploi créée avec succès', 201);
});

/**
 * @desc    Récupérer toutes les offres d'emploi (avec filtres & pagination)
 * @route   GET /api/v1/jobs
 * @access  Public
 */
const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationOptions(req.query);
  
  // Construire la requête de filtres
  const query = { status: JOB_STATUS.ACTIVE, isExpired: false };
  
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  if (req.query.category) query.category = req.query.category;
  if (req.query.type) query.type = req.query.type;
  if (req.query.experienceLevel) query.experienceLevel = req.query.experienceLevel;
  if (req.query.remote === 'true') query['location.remote'] = true;
  if (req.query.city) query['location.city'] = new RegExp(req.query.city, 'i');

  const jobs = await Job.find(query)
    .populate('companyId', 'companyName logo industry location')
    .sort(req.query.search ? { score: { $meta: 'textScore' } } : sort)
    .skip(skip)
    .limit(limit)
    // Ne pas renvoyer le lourd embedding vectoriel
    .select('-embedding');

  const total = await Job.countDocuments(query);
  
  const response = buildPaginatedResponse(jobs, total, page, limit);
  return sendSuccess(res, response);
});

/**
 * @desc    Récupérer une offre par ID
 * @route   GET /api/v1/jobs/:id
 * @access  Public
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('companyId', 'companyName logo website industry companySize description location socialLinks')
    .select('-embedding');

  if (!job) {
    throw ApiError.notFound('Offre introuvable');
  }

  // Incrémenter les vues
  job.viewCount += 1;
  await job.save({ validateBeforeSave: false });

  return sendSuccess(res, { job });
});

/**
 * @desc    Récupérer les offres créées par l'entreprise connectée
 * @route   GET /api/v1/jobs/company/mine
 * @access  Privé (Entreprise)
 */
const getMyJobs = asyncHandler(async (req, res) => {
  const company = await require('../models/Company.model').findOne({ userId: req.user._id });
  if (!company) throw ApiError.forbidden('Profil entreprise introuvable');

  const { page, limit, skip, sort } = getPaginationOptions(req.query);

  const jobs = await Job.find({ companyId: company._id })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-embedding');

  const total = await Job.countDocuments({ companyId: company._id });
  
  const response = buildPaginatedResponse(jobs, total, page, limit);
  return sendSuccess(res, response);
});

/**
 * @desc    Mettre à jour une offre
 * @route   PUT /api/v1/jobs/:id
 * @access  Privé (Entreprise propriétaire)
 */
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) throw ApiError.notFound('Offre introuvable');
  
  // Vérifier la propriété (le job appartient à l'user connecté)
  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Non autorisé à modifier cette offre');
  }

  const updatedJob = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-embedding');

  return sendSuccess(res, { job: updatedJob }, 'Offre mise à jour');
});

/**
 * @desc    Changer le statut d'une offre (pause, cloture)
 * @route   PATCH /api/v1/jobs/:id/status
 * @access  Privé (Entreprise propriétaire)
 */
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Object.values(JOB_STATUS).includes(status)) {
    throw ApiError.badRequest('Statut invalide');
  }

  const job = await Job.findById(req.params.id);
  
  if (!job) throw ApiError.notFound('Offre introuvable');
  if (job.postedBy.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Non autorisé');
  }

  job.status = status;
  await job.save({ validateBeforeSave: false });

  return sendSuccess(res, { job }, `Offre passée au statut : ${status}`);
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  getMyJobs,
  updateJob,
  updateJobStatus,
};
