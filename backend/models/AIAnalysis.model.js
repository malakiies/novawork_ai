const mongoose = require('mongoose');

/**
 * @collection ai_analyses
 * @description Résultats de l'analyse IA (GPT-4o) d'un CV.
 *              Contient les données extraites structurées, les scores, les suggestions
 *              et l'embedding vectoriel pour le matching sémantique.
 */

const experienceItemSchema = new mongoose.Schema(
  {
    title:       { type: String },
    company:     { type: String },
    startDate:   { type: String }, // Format libre (ex: "Jan 2022")
    endDate:     { type: String }, // "Present" si poste actuel
    isCurrent:   { type: Boolean, default: false },
    duration:    { type: String }, // "2 ans 3 mois"
    description: { type: String },
    skills:      { type: [String], default: [] },
    location:    { type: String },
  },
  { _id: false }
);

const educationItemSchema = new mongoose.Schema(
  {
    degree:         { type: String },
    institution:    { type: String },
    field:          { type: String },
    graduationYear: { type: Number },
    grade:          { type: String },
    honors:         { type: String },
  },
  { _id: false }
);

const languageItemSchema = new mongoose.Schema(
  {
    name:  { type: String },
    level: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native', 'unknown'] },
    certification: { type: String, default: null },
  },
  { _id: false }
);

const scoreBreakdownSchema = new mongoose.Schema(
  {
    technical:      { type: Number, min: 0, max: 100, default: 0 },
    softSkills:     { type: Number, min: 0, max: 100, default: 0 },
    formatting:     { type: Number, min: 0, max: 100, default: 0 },
    keywords:       { type: Number, min: 0, max: 100, default: 0 },
    experience:     { type: Number, min: 0, max: 100, default: 0 },
    education:      { type: Number, min: 0, max: 100, default: 0 },
    achievements:   { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

// ─── Schéma principal ─────────────────────────────────────────────────────────
const aiAnalysisSchema = new mongoose.Schema(
  {
    // ─── Références ──────────────────────────────────────────────────────────
    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ─── Données extraites ───────────────────────────────────────────────────
    extractedData: {
      fullName:    { type: String, default: null },
      email:       { type: String, default: null },
      phone:       { type: String, default: null },
      location:    { type: String, default: null },
      linkedinUrl: { type: String, default: null },
      portfolioUrl:{ type: String, default: null },
      summary:     { type: String, default: null },

      skills: {
        technical:   { type: [String], default: [] },
        soft:        { type: [String], default: [] },
        tools:       { type: [String], default: [] },
        all:         { type: [String], default: [] }, // Union des 3
      },
      experience:   { type: [experienceItemSchema], default: [] },
      education:    { type: [educationItemSchema], default: [] },
      languages:    { type: [languageItemSchema], default: [] },
      certifications: { type: [String], default: [] },
      achievements:   { type: [String], default: [] },

      totalExperienceYears: { type: Number, default: 0 },
      seniorityLevel:       { type: String, enum: ['no_experience', 'junior', 'mid', 'senior', 'lead', 'executive'], default: 'junior' },
    },

    // ─── Scores ──────────────────────────────────────────────────────────────
    scores: {
      overall:       { type: Number, min: 0, max: 100, default: 0 },
      ats:           { type: Number, min: 0, max: 100, default: 0 }, // Applicant Tracking System score
      readability:   { type: Number, min: 0, max: 100, default: 0 },
      completeness:  { type: Number, min: 0, max: 100, default: 0 },
      breakdown:     { type: scoreBreakdownSchema, default: () => ({}) },
    },

    // ─── Analyse qualitative ─────────────────────────────────────────────────
    strengths:   { type: [String], default: [] },
    weaknesses:  { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    keywords:    { type: [String], default: [] }, // Mots-clés détectés dans le CV
    redFlags:    { type: [String], default: [] }, // Points négatifs critiques

    // ─── Embedding vectoriel ─────────────────────────────────────────────────
    embedding: {
      type: [Number], // 1536 dimensions (text-embedding-3-small)
      default: null,
      select: false,
    },

    // ─── Métadonnées OpenAI ──────────────────────────────────────────────────
    modelUsed: {
      type: String,
      default: 'gpt-4o',
    },
    promptTokens:     { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens:      { type: Number, default: 0 },

    // ─── Statut de l'analyse ─────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
aiAnalysisSchema.index({ userId: 1, status: 1 });
aiAnalysisSchema.index({ 'scores.overall': -1 });
aiAnalysisSchema.index({ 'extractedData.skills.all': 1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
