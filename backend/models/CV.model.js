const mongoose = require('mongoose');

/**
 * @collection cvs
 * @description CVs uploadés par les candidats (stockés sur Cloudinary).
 *              Chaque candidat peut avoir plusieurs CVs (un marqué principal).
 *              Le texte extrait alimente l'analyse IA.
 */
const cvSchema = new mongoose.Schema(
  {
    // ─── Référence candidat ──────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },

    // ─── Fichier Cloudinary ───────────────────────────────────────────────────
    fileName: {
      type: String,
      required: [true, 'Le nom du fichier est obligatoire'],
      trim: true,
    },
    originalName: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'L\'URL du fichier est obligatoire'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
      select: false,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'doc'],
      required: [true, 'Le type de fichier est obligatoire'],
    },
    fileSize: {
      type: Number, // En octets
      required: true,
      max: [5 * 1024 * 1024, 'Fichier trop lourd (max 5 Mo)'],
    },

    // ─── Contenu extrait ─────────────────────────────────────────────────────
    rawText: {
      type: String, // Texte brut extrait du CV (pdf-parse / mammoth)
      select: false, // Volumineux — exclu par défaut
    },
    pageCount: {
      type: Number,
      default: 1,
    },

    // ─── Statut ──────────────────────────────────────────────────────────────
    isPrimary: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAnalyzed: {
      type: Boolean,
      default: false,
      index: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIAnalysis',
      default: null,
    },

    // ─── Données rapides extraites (avant analyse complète) ──────────────────
    quickExtract: {
      name:     { type: String, default: null },
      email:    { type: String, default: null },
      phone:    { type: String, default: null },
      skills:   { type: [String], default: [] },
    },

    // ─── Métadonnées ─────────────────────────────────────────────────────────
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
cvSchema.index({ userId: 1, isPrimary: 1 });
cvSchema.index({ userId: 1, createdAt: -1 });
cvSchema.index({ isAnalyzed: 1 });

// ─── Validation : max 5 CVs par utilisateur ───────────────────────────────────
cvSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    if (count >= 5) {
      return next(new Error('Maximum 5 CVs par compte'));
    }
  }
  next();
});

// ─── Ensure only one CV primary per user ─────────────────────────────────────
cvSchema.pre('save', async function (next) {
  if (this.isModified('isPrimary') && this.isPrimary) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

module.exports = mongoose.model('CV', cvSchema);
