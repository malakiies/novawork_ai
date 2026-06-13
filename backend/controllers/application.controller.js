const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Récupérer le board Kanban des candidatures de l'entreprise
 * @route   GET /api/v1/applications/company/board
 * @access  Privé (Company)
 */
const getCompanyBoard = asyncHandler(async (req, res) => {
  // Optionnel : filtrer par jobId si passé en query
  const { jobId } = req.query;
  const filter = { companyId: req.user.companyId };
  if (jobId) filter.jobId = jobId;

  const applications = await Application.find(filter)
    .populate('candidateId', 'firstName lastName email profilePicture')
    .populate('jobId', 'title')
    .sort('-appliedAt');

  // Grouper par statut (pending, viewed, shortlisted, interview, hired)
  const columns = {
    pending: { id: 'pending', title: 'Nouveau', items: [] },
    viewed: { id: 'viewed', title: 'Vue', items: [] },
    shortlisted: { id: 'shortlisted', title: 'Présélectionné', items: [] },
    interview: { id: 'interview', title: 'Entretien', items: [] },
    hired: { id: 'hired', title: 'Embauché', items: [] }
  };

  applications.forEach(app => {
    // Si le statut de l'app n'est pas dans nos 5 colonnes principales, on le met dans la plus proche
    // ou on ignore (ex: rejected). Pour ce MVP, on map les principaux.
    const colId = columns[app.status] ? app.status : 'pending'; 
    columns[colId].items.push(app);
  });

  return sendSuccess(res, columns);
});

/**
 * @desc    Mettre à jour le statut d'une candidature (Drag & Drop)
 * @route   PUT /api/v1/applications/:id/status
 * @access  Privé (Company)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'viewed', 'shortlisted', 'interview', 'technical', 'offered', 'hired', 'rejected', 'withdrawn'];

  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest('Statut invalide');
  }

  const application = await Application.findOne({
    _id: req.params.id,
    companyId: req.user.companyId
  });

  if (!application) {
    throw ApiError.notFound('Candidature introuvable');
  }

  application.status = status;
  // Le pre('save') middleware ajoutera automatiquement l'entrée dans statusHistory
  await application.save();

  return sendSuccess(res, application, 'Statut mis à jour avec succès');
});

module.exports = {
  getCompanyBoard,
  updateStatus
};
