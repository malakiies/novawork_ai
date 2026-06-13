const mongoose = require('mongoose');

/**
 * @collection cover_letters
 * @description Lettres de motivation générées par IA ou rédigées manuellement.
 *              Liées optionnellement à une offre et à un CV source.
 */
const coverLetterSchema = new mongoose.Schema(
  {
    // ─── Références ──────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },
    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      default: null,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },

    // ─── Contenu ─────────────────────────────────────────────────────────────
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Titre trop long'],
      default: 'Lettre de motivation',
    },
    content: {
      type: String,
      required: [true, 'Le contenu est obligatoire'],
      minlength: [50, 'Contenu trop court'],
      maxlength: [10000, 'Contenu trop long (max 10 000 caractères)'],
    },

    // ─── Paramètres de génération ────────────────────────────────────────────
    generationParams: {
      tone: {
        type: String,
        enum: ['formal', 'creative', 'enthusiastic', 'concise', 'storytelling'],
        default: 'formal',
      },
      language: {
        type: String,
        enum: ['fr', 'en', 'es', 'de', 'ar'],
        default: 'fr',
      },
      wordCount: {
        type: Number,
        enum: [200, 300, 400, 500],
        default: 300,
      },
      targetJobTitle:    { type: String, default: null },
      targetCompanyName: { type: String, default: null },
      highlightedSkills: { type: [String], default: [] },
    },

    // ─── Métadonnées IA ──────────────────────────────────────────────────────
    isAIGenerated: {
      type: Boolean,
      default: false,
      index: true,
    },
    aiVersion: {
      type: String, // ex: "gpt-4o"
      default: null,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },

    // ─── Statut ──────────────────────────────────────────────────────────────
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },

    // ─── Export ──────────────────────────────────────────────────────────────
    pdfUrl: {
      type: String, // URL Cloudinary si exporté en PDF
      default: null,
    },
    lastExportedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
coverLetterSchema.index({ userId: 1, createdAt: -1 });
coverLetterSchema.index({ userId: 1, jobId: 1 });
coverLetterSchema.index({ userId: 1, isFavorite: 1 });

module.exports = mongoose.model('CoverLetter', coverLetterSchema);
