const mongoose = require('mongoose');

/**
 * @collection applications
 * @description Candidatures des candidats aux offres d'emploi.
 *              Contient le score IA de matching, le statut du pipeline et les notes internes.
 */
const applicationSchema = new mongoose.Schema(
  {
    // ─── Références ──────────────────────────────────────────────────────────
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'L\'offre est obligatoire'],
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Le candidat est obligatoire'],
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      required: [true, 'Le CV est obligatoire'],
    },
    coverLetterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CoverLetter',
      default: null,
    },

    // ─── Pipeline de recrutement ─────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: [
          'pending',      // Candidature envoyée, non vue
          'viewed',       // Vue par l'entreprise
          'shortlisted',  // Présélectionné
          'interview',    // Entretien planifié
          'technical',    // Test technique
          'offered',      // Offre envoyée
          'hired',        // Embauché
          'rejected',     // Refusé par l'entreprise
          'withdrawn',    // Retiré par le candidat
        ],
        message: 'Statut invalide : {VALUE}',
      },
      default: 'pending',
      index: true,
    },
    statusHistory: {
      type: [
        {
          status:    { type: String, required: true },
          changedAt: { type: Date, default: Date.now },
          changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          note:      { type: String },
        },
      ],
      default: [{ status: 'pending', changedAt: new Date() }],
    },

    // ─── Score IA ────────────────────────────────────────────────────────────
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      index: true,
    },
    matchDetails: {
      semanticScore:  { type: Number, default: null }, // Cosine similarity optionnelle
      skillsScore:    { type: Number, default: null }, // Compatibilité compétences
      experienceScore:{ type: Number, default: null }, // Compatibilité expérience
      educationScore: { type: Number, default: null }, // Compatibilité diplôme
    },
    matchAnalysis: {
      strengths:      { type: [String], default: [] },
      weaknesses:     { type: [String], default: [] },
      recommendations:{ type: [String], default: [] },
    },

    // ─── Messages & Notes ────────────────────────────────────────────────────
    candidateMessage: {
      type: String,
      trim: true,
      maxlength: [2000, 'Message trop long'],
      default: null,
    },
    internalNote: {
      type: String,
      trim: true,
      maxlength: [3000, 'Note interne trop longue'],
      default: null,
      select: false, // Invisible au candidat
    },

    // ─── Entretien ───────────────────────────────────────────────────────────
    interview: {
      scheduledAt:  { type: Date, default: null },
      location:     { type: String, default: null },
      type:         { type: String, enum: ['video', 'phone', 'onsite', null], default: null },
      link:         { type: String, default: null }, // Lien Zoom/Meet
      confirmedByCandidate: { type: Boolean, default: false },
    },

    // ─── Métadonnées ─────────────────────────────────────────────────────────
    viewedAt: {
      type: Date,
      default: null,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
// Empêche qu'un candidat postule 2 fois au même job
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ companyId: 1, status: 1 });
applicationSchema.index({ matchScore: -1 });
applicationSchema.index({ appliedAt: -1 });

// ─── Middleware : mise à jour de statusHistory ────────────────────────────────
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

// ─── Virtual : daysAgo ───────────────────────────────────────────────────────
applicationSchema.virtual('daysAgo').get(function () {
  return Math.floor((Date.now() - this.appliedAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Application', applicationSchema);
