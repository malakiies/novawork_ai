const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: null,
    },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true, default: 'France' },
      remote: { type: Boolean, default: false },
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    experience: [
      {
        title: { type: String },
        company: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String },
      }
    ],
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        field: { type: String },
        graduationYear: { type: Number },
      }
    ],
    languages: [
      {
        name: { type: String },
        level: { type: String, enum: ['basic', 'intermediate', 'fluent', 'native'] },
      }
    ],
    salaryExpectation: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'EUR' },
    },
    availability: {
      type: String,
      enum: ['immediate', '1month', '3months', 'not_looking'],
      default: 'immediate',
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      portfolio: { type: String },
    },
    profileCompletion: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

candidateProfileSchema.index({ 'location.city': 1, 'location.country': 1 });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
