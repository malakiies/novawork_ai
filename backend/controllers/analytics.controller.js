const User = require('../models/User.model');
const Company = require('../models/Company.model');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');
const Payment = require('../models/Payment.model');
const { sendSuccess } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Obtenir toutes les métriques pour le Dashboard Admin
 * @route   GET /api/v1/analytics/dashboard
 * @access  Privé (Admin uniquement)
 */
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Statistiques globales rapides
  const totalUsers = await User.countDocuments();
  const totalCompanies = await Company.countDocuments({ status: 'active' });
  const totalJobs = await Job.countDocuments({ status: 'published' });
  const totalApplications = await Application.countDocuments();

  // 2. Calcul du MRR (Monthly Recurring Revenue) via les paiements
  // On prend tous les abonnements en cours.
  const mrrAggregation = await Payment.aggregate([
    { $match: { subscriptionStatus: 'active' } },
    {
      $group: {
        _id: null,
        totalMRR: { $sum: '$pricePerCycle' }
      }
    }
  ]);
  const currentMRR = mrrAggregation.length > 0 ? (mrrAggregation[0].totalMRR / 100) : 0;

  // 3. Répartition des plans (Pie Chart)
  const plansDistribution = await Payment.aggregate([
    { $match: { subscriptionStatus: 'active' } },
    { $group: { _id: '$plan', count: { $sum: 1 } } },
    { $project: { name: '$_id', value: '$count', _id: 0 } }
  ]);

  // Si pas de data, on met des zéros par défaut pour que le chart s'affiche
  const formattedPlansDist = plansDistribution.length > 0 ? plansDistribution : [
    { name: 'free', value: 0 },
    { name: 'starter', value: 0 },
    { name: 'pro', value: 0 },
    { name: 'enterprise', value: 0 }
  ];

  // 4. Évolution des inscriptions (Bar Chart) - 6 derniers mois
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const usersTrend = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        users: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const companiesTrend = await Company.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        companies: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Formater les données de tendances (merger User et Company par mois)
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const acquisitionData = [];
  
  // Utiliser les mois des utilisateurs comme base
  usersTrend.forEach(u => {
    const monthName = monthNames[u._id.month - 1];
    const compMatch = companiesTrend.find(c => c._id.month === u._id.month && c._id.year === u._id.year);
    
    acquisitionData.push({
      name: monthName,
      Utilisateurs: u.users,
      Entreprises: compMatch ? compMatch.companies : 0
    });
  });

  // 5. Revenus sur 6 mois (Line Chart) via les transactions
  const revenueTrend = await Payment.aggregate([
    { $unwind: '$transactions' },
    { $match: { 'transactions.status': 'succeeded', 'transactions.paidAt': { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          month: { $month: '$transactions.paidAt' },
          year: { $year: '$transactions.paidAt' }
        },
        revenue: { $sum: '$transactions.amount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const revenueData = revenueTrend.map(r => ({
    name: monthNames[r._id.month - 1],
    MRR: r.revenue / 100
  }));

  // 6. Santé Serveur et Alertes (Mock dynamique pour l'exemple)
  const apiHealth = 99.9;
  const recentErrors = 0; // On pourrait brancher ça sur la collection d'erreurs/logs si elle existait

  return sendSuccess(res, {
    kpis: {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      currentMRR,
      apiHealth
    },
    charts: {
      plansDistribution: formattedPlansDist,
      acquisitionData,
      revenueData
    },
    alerts: [
      ...(recentErrors > 10 ? [{ type: 'error', title: 'Taux d\'erreur élevé', message: `${recentErrors} erreurs détectées cette heure.` }] : []),
      ...(totalCompanies === 0 ? [{ type: 'warning', title: 'Aucune entreprise', message: 'Il faut attirer des entreprises pour générer du MRR.' }] : [])
    ]
  });
});

module.exports = {
  getAdminDashboardStats
};
