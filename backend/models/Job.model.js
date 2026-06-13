const mongoose = require('mongoose');

/**
 * @collection jobs
 * @description Offres d'emploi publiées par les entreprises.
 *              Contient l'embedding OpenAI pour le matching IA vectoriel.
 */

const salarySchema = new mongoose.Schema(
  {
    min:        { type: Number, min: 0 },
    max:        { type: Number, min: 0 },
    currency:   { type: String, default: 'EUR', maxlength: 3 },
    period:     { type: String, enum: ['hour', 'day', 'month', 'year'], default: 'year' },
    disclosed:  { type: Boolean, default: true }, // false = "Salaire confidentiel"
  },
  { _id: false }
);

const jobLocationSchema = new mongoose.Schema(
  {
    city:    { type: String, trim: true, index: true },
    country: { type: String, trim: true, default: 'France', index: true },
    remote:  { type: Boolean, default: false, index: true },
    hybrid:  { type: Boolean, default: false },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    // ─── Références ──────────────────────────────────────────────────────────
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'L\'entreprise est obligatoire'],
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Contenu de l'offre ──────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Le titre du poste est obligatoire'],
      trim: true,
      minlength: [5, 'Titre trop court'],
      maxlength: [150, 'Titre trop long'],
    },
    slug: {
      type: String,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      minlength: [100, 'Description trop courte (min 100 caractères)'],
      maxlength: [15000, 'Description trop longue'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    niceToHave: {
      type: [String],
      default: [],
    },

    // ─── Classification ──────────────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'La catégorie est obligatoire'],
      enum: [
        'engineering', 'design', 'marketing', 'sales', 'finance',
        'hr', 'operations', 'legal', 'customer_support', 'data',
        'product', 'management', 'healthcare', 'education', 'other',
      ],
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'apprenticeship'],
      default: 'full_time',
      index: true,
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['no_experience', 'junior', 'mid', 'senior', 'lead', 'executive'],
      index: true,
    },
    educationLevel: {
      type: String,
      enum: ['none', 'bac', 'bac+2', 'bac+3', 'bac+5', 'doctorate'],
      default: 'none',
    },

    // ─── Compétences ─────────────────────────────────────────────────────────
    skills: {
      type: [String],
      required: [true, 'Au moins une compétence requise'],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 30,
        message: 'Entre 1 et 30 compétences',
      },
      index: true,
    },
    languages: {
      type: [
        {
          name:  { type: String, required: true },
          level: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'], required: true },
        },
      ],
      default: [],
    },

    // ─── Localisation & Rémunération ─────────────────────────────────────────
    location: {
      type: jobLocationSchema,
      required: true,
      default: () => ({}),
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },

    // ─── Statut & Visibilité ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'closed', 'expired', 'rejected'],
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAIEnhanced: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      index: { expireAfterSeconds: 0 }, // TTL index MongoDB natif
    },

    // ─── Compteurs ───────────────────────────────────────────────────────────
    applicationCount: { type: Number, default: 0, min: 0 },
    viewCount:        { type: Number, default: 0, min: 0 },
    saveCount:        { type: Number, default: 0, min: 0 },

    // ─── IA — Embedding vectoriel ─────────────────────────────────────────────
    embedding: {
      type: [Number], // Vecteur OpenAI text-embedding-3-small (1536 dims)
      default: null,
      select: false,  // Exclu des queries par défaut (lourd)
    },

    // ─── Modération admin ────────────────────────────────────────────────────
    moderationNote: {
      type: String,
      default: null,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ category: 1, type: 1, status: 1 });
jobSchema.index({ experienceLevel: 1, status: 1 });
jobSchema.index({ 'location.city': 1, 'location.remote': 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

// ─── Pre-save : slug ─────────────────────────────────────────────────────────
jobSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = `${this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80)}-${Date.now()}`;
  }
  next();
});

// ─── Virtual : isExpired ─────────────────────────────────────────────────────
jobSchema.virtual('isExpired').get(function () {
  return this.expiresAt && this.expiresAt < new Date();
});

module.exports = mongoose.model('Job', jobSchema);
