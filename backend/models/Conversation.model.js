const mongoose = require('mongoose');

/**
 * @collection conversations
 * @description Sessions de chat IA (coach carrière).
 *              Une conversation = une session thématique avec historique de messages.
 */
const conversationSchema = new mongoose.Schema(
  {
    // ─── Référence utilisateur ───────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },

    // ─── Métadonnées session ─────────────────────────────────────────────────
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Titre trop long'],
      default: 'Nouvelle conversation',
    },
    context: {
      type: String,
      enum: [
        'career_advice',      // Conseils de carrière généraux
        'cv_review',          // Révision de CV
        'interview_prep',     // Préparation entretien
        'salary_negotiation', // Négociation salariale
        'job_search',         // Stratégie de recherche
        'cover_letter',       // Aide lettre de motivation
        'general',            // Général
      ],
      default: 'general',
      index: true,
    },

    // ─── Contexte IA injecté ─────────────────────────────────────────────────
    systemContext: {
      // Contexte candidat injecté dans le prompt système (skills, expériences)
      candidateSummary: { type: String, default: null },
      // Référence à un job pour contextualiser les conseils
      relatedJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null,
      },
      relatedCvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CV',
        default: null,
      },
    },

    // ─── Statistiques ────────────────────────────────────────────────────────
    messageCount: {
      type: Number,
      default: 0,
    },
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: true,
    },

    // ─── Statut ──────────────────────────────────────────────────────────────
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },

    // ─── Rating utilisateur ──────────────────────────────────────────────────
    userRating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, maxlength: 500, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
conversationSchema.index({ userId: 1, isArchived: 1, lastMessageAt: -1 });
conversationSchema.index({ userId: 1, context: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
