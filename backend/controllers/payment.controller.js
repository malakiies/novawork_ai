const { stripe, stripePrices } = require('../config/stripe');
const Payment = require('../models/Payment.model');
const Company = require('../models/Company.model');
const notificationService = require('../services/notification.service');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

/**
 * @desc    Générer une session Stripe Checkout pour souscrire à un abonnement
 * @route   POST /api/v1/payments/create-checkout-session
 * @access  Privé (Company)
 */
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { plan } = req.body; // 'starter', 'pro', 'enterprise'

  if (!stripePrices[plan]) {
    throw ApiError.badRequest('Plan invalide ou non initialisé.');
  }

  // 1. Récupérer l'entreprise et son historique de paiement
  const company = await Company.findById(req.user.companyId);
  if (!company) throw ApiError.notFound('Entreprise introuvable');

  let paymentRecord = await Payment.findOne({ companyId: company._id });
  let customerId;

  // 2. Créer un Customer Stripe s'il n'existe pas
  if (!paymentRecord || !paymentRecord.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: req.user.email, // email du boss
      name: company.name,
      metadata: { companyId: company._id.toString() }
    });
    customerId = customer.id;

    if (!paymentRecord) {
      paymentRecord = await Payment.create({
        companyId: company._id,
        userId: req.user._id,
        stripeCustomerId: customerId,
        plan: 'free'
      });
    } else {
      paymentRecord.stripeCustomerId = customerId;
      await paymentRecord.save();
    }
  } else {
    customerId = paymentRecord.stripeCustomerId;
  }

  // 3. Créer la session Checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: stripePrices[plan],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.CLIENT_URL}/company/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/company/billing?canceled=true`,
    metadata: {
      companyId: company._id.toString(),
      plan: plan
    }
  });

  return sendSuccess(res, { url: session.url });
});

/**
 * @desc    Rediriger vers le portail client Stripe pour gérer son abonnement
 * @route   POST /api/v1/payments/customer-portal
 * @access  Privé (Company)
 */
const createCustomerPortal = asyncHandler(async (req, res) => {
  const paymentRecord = await Payment.findOne({ companyId: req.user.companyId });
  if (!paymentRecord || !paymentRecord.stripeCustomerId) {
    throw ApiError.badRequest('Aucun abonnement trouvé. Veuillez souscrire à un plan d\'abord.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: paymentRecord.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/company/billing`,
  });

  return sendSuccess(res, { url: session.url });
});

/**
 * @desc    Récupérer les informations de facturation (historique, statut actuel)
 * @route   GET /api/v1/payments/my-billing
 * @access  Privé (Company)
 */
const getBillingInfo = asyncHandler(async (req, res) => {
  let paymentRecord = await Payment.findOne({ companyId: req.user.companyId });
  
  if (!paymentRecord) {
    // Return a default free plan structure if none exists
    return sendSuccess(res, { 
      billing: {
        plan: 'free',
        subscriptionStatus: 'none',
        transactions: []
      }
    });
  }

  return sendSuccess(res, { billing: paymentRecord });
});

/**
 * @desc    Webhook Stripe (Écoute les événements Stripe de manière asynchrone)
 * @route   POST /api/v1/payments/webhook
 * @access  Public (Serveur à Serveur)
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body est un Buffer brut ici grâce à express.raw dans index.js
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_fake_for_dev');
  } catch (err) {
    logger.error('Erreur signature webhook Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Traitement des événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const companyId = session.metadata.companyId;
        const plan = session.metadata.plan;

        await Payment.findOneAndUpdate(
          { companyId },
          {
            stripeSubscriptionId: session.subscription,
            plan: plan,
            subscriptionStatus: 'active',
            $push: { planHistory: { plan, reason: 'upgrade' } }
          }
        );
        logger.info(`✅ Abonnement activé pour la company ${companyId} (Plan: ${plan})`);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const paymentRecord = await Payment.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          {
            $push: {
              transactions: {
                stripePaymentIntentId: invoice.payment_intent,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid,
                currency: invoice.currency,
                status: 'succeeded',
                invoiceUrl: invoice.hosted_invoice_url,
                receiptUrl: invoice.receipt_url,
                paidAt: new Date(invoice.status_transitions?.paid_at ? invoice.status_transitions.paid_at * 1000 : Date.now())
              }
            }
          },
          { new: true } // to get the updated document
        );
        
        // Notification temps réel
        if (paymentRecord && paymentRecord.userId) {
          await notificationService.notifyPaymentSuccess(
            paymentRecord.userId, 
            invoice.amount_paid, 
            invoice.hosted_invoice_url
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await Payment.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            plan: 'free',
            subscriptionStatus: 'canceled',
            stripeSubscriptionId: null,
            stripePriceId: null,
            canceledAt: new Date(),
            $push: { planHistory: { plan: 'free', reason: 'cancel' } }
          }
        );
        logger.info(`❌ Abonnement annulé pour subscription ${subscription.id}`);
        break;
      }
      
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    logger.error('Erreur traitement webhook Stripe:', err);
    res.status(500).send('Webhook Handler Error');
  }
};

module.exports = {
  createCheckoutSession,
  createCustomerPortal,
  getBillingInfo,
  handleWebhook
};
