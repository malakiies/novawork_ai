const Joi = require('joi');
const { ApiError } = require('../utils/response.utils');

/**
 * validate — Factory de middleware de validation Joi.
 * @param {Joi.Schema} schema — Schéma Joi
 * @param {string} source — 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,      // Retourner toutes les erreurs, pas seulement la première
    stripUnknown: true,     // Retirer les champs non définis dans le schéma
    convert: true,          // Convertir les types automatiquement
  });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/['"]/g, ''));
    return next(ApiError.badRequest('Données invalides', errors));
  }

  req[source] = value; // Remplacer par les données validées et nettoyées
  next();
};

// ─── Schémas de validation ────────────────────────────────────────────────────

const schemas = {

  // AUTH
  register: Joi.object({
    email:     Joi.string().email().required().messages({ 'any.required': 'Email obligatoire' }),
    password:  Joi.string().min(8).required().messages({ 'string.min': 'Mot de passe : minimum 8 caractères' }),
    role:      Joi.string().valid('candidate', 'company').required(),
    firstName: Joi.string().trim().max(50).when('role', { is: 'candidate', then: Joi.required() }),
    lastName:  Joi.string().trim().max(50).when('role', { is: 'candidate', then: Joi.required() }),
    companyName: Joi.string().trim().max(150).when('role', { is: 'company', then: Joi.required() }),
  }),

  login: Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token:    Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),

  // JOBS
  createJob: Joi.object({
    title:           Joi.string().min(5).max(150).required(),
    description:     Joi.string().min(100).max(15000).required(),
    category:        Joi.string().valid('engineering','design','marketing','sales','finance','hr','operations','legal','customer_support','data','product','management','healthcare','education','other').required(),
    type:            Joi.string().valid('full_time','part_time','contract','freelance','internship','apprenticeship').required(),
    experienceLevel: Joi.string().valid('no_experience','junior','mid','senior','lead','executive').required(),
    skills:          Joi.array().items(Joi.string()).min(1).max(30).required(),
    location: Joi.object({
      city:    Joi.string().allow(''),
      country: Joi.string().default('France'),
      remote:  Joi.boolean().default(false),
      hybrid:  Joi.boolean().default(false),
    }).required(),
    salary: Joi.object({
      min:       Joi.number().min(0),
      max:       Joi.number().min(0),
      currency:  Joi.string().max(3).default('EUR'),
      period:    Joi.string().valid('hour','day','month','year').default('year'),
      disclosed: Joi.boolean().default(true),
    }),
    requirements:     Joi.array().items(Joi.string()),
    responsibilities: Joi.array().items(Joi.string()),
    expiresAt:        Joi.date().greater('now'),
  }),

  // APPLICATIONS
  createApplication: Joi.object({
    jobId:           Joi.string().hex().length(24).required(),
    cvId:            Joi.string().hex().length(24).required(),
    coverLetterId:   Joi.string().hex().length(24).allow(null, ''),
    candidateMessage:Joi.string().max(2000).allow(''),
  }),

  // COVER LETTER
  generateCoverLetter: Joi.object({
    jobId:    Joi.string().hex().length(24).allow(null, ''),
    cvId:     Joi.string().hex().length(24).required(),
    tone:     Joi.string().valid('formal','creative','enthusiastic','concise','storytelling').default('formal'),
    language: Joi.string().valid('fr','en','es','de','ar').default('fr'),
    wordCount:Joi.number().valid(200,300,400,500).default(300),
  }),

  // PAGINATION
  pagination: Joi.object({
    page:  Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort:  Joi.string().default('-createdAt'),
  }).unknown(true), // Autorise les filtres supplémentaires
};

module.exports = { validate, schemas };
