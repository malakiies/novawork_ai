const express = require('express');
const router = express.Router();

// Importer les différentes routes
const authRoutes = require('./auth.routes');
// Autres imports à venir...
// const candidateRoutes = require('./candidate.routes');
// const companyRoutes = require('./company.routes');
const jobRoutes = require('./job.routes');
const applicationRoutes = require('./application.routes');
const cvRoutes = require('./cv.routes');
const coverLetterRoutes = require('./coverLetter.routes');
const chatRoutes = require('./chat.routes');
const paymentRoutes = require('./payment.routes');
const notificationRoutes = require('./notification.routes');
const analyticsRoutes = require('./analytics.routes');
// const adminRoutes = require('./admin.routes');

// Définir les préfixes
router.use('/auth', authRoutes);
// router.use('/candidates', candidateRoutes);
// router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/cv', cvRoutes);
router.use('/cover-letters', coverLetterRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
// router.use('/admin', adminRoutes);

module.exports = router;
