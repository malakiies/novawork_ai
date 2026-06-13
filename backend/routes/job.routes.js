const express = require('express');
const router = express.Router();

const jobController = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireCompany, requireRole } = require('../middleware/role.middleware');
const { validate, schemas } = require('../middleware/validate.middleware');

// Routes publiques
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Routes privées (Entreprise)
router.use(protect); // Toutes les routes en dessous nécessitent d'être connecté

router.get('/company/mine', requireCompany, jobController.getMyJobs);

router.post('/', 
  requireCompany, 
  validate(schemas.createJob), 
  jobController.createJob
);

router.put('/:id', 
  requireCompany, 
  validate(schemas.createJob), // On réutilise le même schéma (ou un schéma update si partiel)
  jobController.updateJob
);

const matchController = require('../controllers/match.controller');

router.patch('/:id/status', 
  requireCompany, 
  jobController.updateJobStatus
);

// Moteur de matching IA "à la volée"
router.post('/:jobId/match/:cvId',
  requireCompany,
  matchController.generateMatch
);

module.exports = router;
