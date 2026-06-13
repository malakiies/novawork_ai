const mongoose = require('mongoose');

/**
 * @collection companies
 * @description Profil entreprise lié à un User (role: 'company').
 *              Contient les informations de l'entreprise, son plan Stripe, ses limites.
 */

// ─── Sous-schémas ─────────────────────────────────────────────────────────────
const locationSchema = new mongoose.Schema(
  {
    address:   { type: String, trim: true },
    city:      { type: String, trim: true, index: true },
    state:     { type: String, trim: true },
    country:   { type: String, trim: true, default: 'France', index: true },
    zipCode:   { type: String, trim: true },
    latitude:  { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin:  { type: String, trim: true, default: null },
    twitter:   { type: String, trim: true, default: null },
    facebook:  { type: String, trim: true, default: null },
    instagram: { type: String, trim: true, default: null },
    website:   { type: String, trim: true, default: null },
  },
  { _id: false }
);

// ─── Schéma principal ─────────────────────────────────────────────────────────
const companySchema = new mongoose.Schema(
  {
    // ─── Référence User ──────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      unique: true,
      index: true,
    },

    // ─── Informations entreprise ─────────────────────────────────────────────
    companyName: {
      type: String,
      required: [true, 'Le nom de l\'entreprise est obligatoire'],
      trim: true,
      maxlength: [150, 'Nom trop long (max 150 caractères)'],
      index: 'text',
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logo: {
      type: String, // URL Cloudinary
      default: null,
    },
    coverImage: {
      type: String, // URL Cloudinary
      default: null,
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'URL invalide (doit commencer par http/https)'],
      default: null,
    },
    industry: {
      type: String,
      required: [true, 'Le secteur d\'activité est obligatoire'],
      enum: [
        'technology', 'finance', 'healthcare', 'education', 'retail',
        'manufacturing', 'consulting', 'media', 'real_estate', 'transport',
        'food', 'energy', 'government', 'ngo', 'other',
      ],
      index: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '1-10',
    },
    foundedYear: {
      type: Number,
      min: [1800, 'Année de fondation invalide'],
      max: [new Date().getFullYear(), 'Année dans le futur'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description trop longue'],
    },
    culture: {
      type: String,
      trim: true,
      maxlength: [2000, 'Culture trop longue'],
    },
    benefits: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'Maximum 20 avantages',
      },
    },
    location: {
      type: locationSchema,
      default: () => ({}),
    },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },

    // ─── Vérification & statut ───────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ─── Plan & abonnement ───────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
      index: true,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      select: false,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },

    // ─── Limites & compteurs ─────────────────────────────────────────────────
    limits: {
      jobPosts:      { type: Number, default: 2 },   // max offres actives
      aiMatching:    { type: Boolean, default: false },
      analytics:     { type: Boolean, default: false },
      featuredJobs:  { type: Number, default: 0 },
    },
    stats: {
      totalJobsPosted:    { type: Number, default: 0 },
      totalApplications:  { type: Number, default: 0 },
      totalHires:         { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
companySchema.index({ companyName: 'text', description: 'text' });
companySchema.index({ industry: 1, plan: 1 });
companySchema.index({ 'location.city': 1, 'location.country': 1 });
companySchema.index({ createdAt: -1 });

// ─── Pre-save : génération du slug ───────────────────────────────────────────
companySchema.pre('save', function (next) {
  if (this.isModified('companyName') && !this.slug) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
