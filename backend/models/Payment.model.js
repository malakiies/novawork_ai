const mongoose = require('mongoose');

/**
 * @collection payments
 * @description Paiements et abonnements Stripe des entreprises.
 *              Gère les plans SaaS (free, starter, pro, enterprise).
 *              Les webhooks Stripe mettent à jour ce modèle automatiquement.
 */

// ─── Sous-schéma : historique des changements de plan ────────────────────────
const planHistorySchema = new mongoose.Schema(
  {
    plan:      { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    reason:    { type: String }, // "upgrade", "downgrade", "cancel", "reactivate"
  },
  { _id: false }
);

// ─── Sous-schéma : transaction individuelle ───────────────────────────────────
const transactionSchema = new mongoose.Schema(
  {
    stripePaymentIntentId: { type: String, required: true },
    stripeInvoiceId:       { type: String, default: null },
    amount:                { type: Number, required: true }, // En centimes (ex: 4900 = 49€)
    currency:              { type: String, default: 'eur' },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
      required: true,
    },
    refundAmount: { type: Number, default: 0 },
    invoiceUrl:   { type: String, default: null },
    receiptUrl:   { type: String, default: null },
    paidAt:       { type: Date, default: null },
    failureReason:{ type: String, default: null },
  },
  { _id: true, timestamps: true }
);

// ─── Schéma principal ─────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema(
  {
    // ─── Référence entreprise ────────────────────────────────────────────────
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'L\'entreprise est obligatoire'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ─── Stripe IDs ──────────────────────────────────────────────────────────
    stripeCustomerId: {
      type: String,
      required: [true, 'Le Stripe Customer ID est obligatoire'],
      unique: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
      index: true,
    },
    stripePriceId: {
      type: String,
      default: null,
    },

    // ─── Plan actuel ─────────────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['free', 'starter', 'pro', 'enterprise'],
      default: 'free',
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    pricePerCycle: {
      type: Number, // En centimes
      default: 0,
    },

    // ─── Statut abonnement ───────────────────────────────────────────────────
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing', 'unpaid', 'incomplete', 'paused', 'none'],
      default: 'none',
      index: true,
    },

    // ─── Dates d'abonnement ──────────────────────────────────────────────────
    trialEndsAt: {
      type: Date,
      default: null,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
      index: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
      default: null,
    },

    // ─── Fonctionnalités du plan ─────────────────────────────────────────────
    features: {
      jobPostsLimit:     { type: Number, default: 2 },
      aiMatchingEnabled: { type: Boolean, default: false },
      analyticsEnabled:  { type: Boolean, default: false },
      featuredJobs:      { type: Number, default: 0 },
      supportLevel:      { type: String, enum: ['basic', 'standard', 'priority', 'dedicated'], default: 'basic' },
    },

    // ─── Transactions ────────────────────────────────────────────────────────
    transactions: {
      type: [transactionSchema],
      default: [],
    },

    // ─── Historique des plans ────────────────────────────────────────────────
    planHistory: {
      type: [planHistorySchema],
      default: [],
    },

    // ─── Coupon / Réduction ──────────────────────────────────────────────────
    coupon: {
      code:       { type: String, default: null },
      discount:   { type: Number, default: 0 }, // En %
      appliedAt:  { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
paymentSchema.index({ companyId: 1, plan: 1 });
paymentSchema.index({ subscriptionStatus: 1, currentPeriodEnd: 1 });
paymentSchema.index({ 'transactions.status': 1 });

// ─── Static : obtenir les features par plan ───────────────────────────────────
paymentSchema.statics.getPlanFeatures = function (plan) {
  const plans = {
    free:       { jobPostsLimit: 2,         aiMatchingEnabled: false, analyticsEnabled: false, featuredJobs: 0, supportLevel: 'basic' },
    starter:    { jobPostsLimit: 10,        aiMatchingEnabled: true,  analyticsEnabled: false, featuredJobs: 1, supportLevel: 'standard' },
    pro:        { jobPostsLimit: 50,        aiMatchingEnabled: true,  analyticsEnabled: true,  featuredJobs: 5, supportLevel: 'priority' },
    enterprise: { jobPostsLimit: Infinity,  aiMatchingEnabled: true,  analyticsEnabled: true,  featuredJobs: 20,supportLevel: 'dedicated' },
  };
  return plans[plan] || plans.free;
};

module.exports = mongoose.model('Payment', paymentSchema);
