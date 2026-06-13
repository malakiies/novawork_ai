const mongoose = require('mongoose');

/**
 * @collection notifications
 * @description Notifications système envoyées aux utilisateurs.
 *              Lues en temps réel via Socket.io et persistées en DB.
 */
const notificationSchema = new mongoose.Schema(
  {
    // ─── Destinataire ─────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },

    // ─── Type & Contenu ───────────────────────────────────────────────────────
    type: {
      type: String,
      required: [true, 'Le type de notification est obligatoire'],
      enum: [
        // Candidat
        'application_received',   // Candidature reçue (pour l'entreprise)
        'application_viewed',     // Candidature vue
        'application_shortlisted',// Présélectionné
        'application_interview',  // Entretien planifié
        'application_offered',    // Offre reçue
        'application_hired',      // Embauché 🎉
        'application_rejected',   // Refusé
        // IA
        'cv_analysis_done',       // Analyse CV terminée
        'new_job_match',          // Nouveau match IA
        'cover_letter_ready',     // Lettre générée
        // Paiement
        'payment_success',        // Paiement réussi
        'payment_failed',         // Échec paiement
        'subscription_renewed',   // Abonnement renouvelé
        'subscription_canceled',  // Abonnement annulé
        'trial_ending',           // Essai se termine dans 3 jours
        // Système
        'welcome',                // Bienvenue sur NovaWork
        'profile_incomplete',     // Profil incomplet
        'job_expiring',           // Offre expirante (pour entreprise)
        'new_applicant',          // Nouveau candidat sur une offre
        'system',                 // Notification système générique
      ],
      index: true,
    },

    // ─── Contenu affiché ──────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      maxlength: [200, 'Titre trop long'],
    },
    body: {
      type: String,
      required: [true, 'Le corps est obligatoire'],
      maxlength: [1000, 'Corps trop long'],
    },
    icon: {
      type: String, // Nom d'icône ou emoji
      default: '🔔',
    },

    // ─── Lien de navigation (frontend) ───────────────────────────────────────
    actionUrl: {
      type: String, // ex: "/applications/64abc..."
      default: null,
    },
    actionLabel: {
      type: String, // ex: "Voir la candidature"
      default: null,
    },

    // ─── Références (pour enrichir le rendu) ─────────────────────────────────
    metadata: {
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
      jobId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
      companyId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
      cvId:          { type: mongoose.Schema.Types.ObjectId, ref: 'CV', default: null },
      paymentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
      extra:         { type: mongoose.Schema.Types.Mixed, default: null },
    },

    // ─── Statut ──────────────────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDelivered: {
      type: Boolean,
      default: false, // true = envoyé via Socket.io
    },
    deliveredAt: {
      type: Date,
      default: null,
    },

    // ─── Priorité ────────────────────────────────────────────────────────────
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true,
    },

    // ─── TTL : suppression automatique après 90 jours ─────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ priority: 1, isDelivered: 1 });

// ─── Méthode : marquer comme lue ─────────────────────────────────────────────
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// ─── Static : compter les non lues ───────────────────────────────────────────
notificationSchema.statics.countUnread = function (userId) {
  return this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
