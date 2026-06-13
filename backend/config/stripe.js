const Stripe = require('stripe');
const logger = require('../utils/logger');

// Initialisation de Stripe (utiliser une clé bidon si non fournie pour éviter les crashs au démarrage)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_fake_key_for_dev', {
  apiVersion: '2023-10-16',
});

// Cache mémoire pour stocker les IDs des prix
const stripePrices = {
  starter: null,
  pro: null,
  enterprise: null,
};

// Définition de nos plans (Prix en centimes d'Euros)
const PLANS = [
  {
    name: 'Starter',
    key: 'starter',
    description: 'Idéal pour les PME. 10 offres d\'emploi et Matching IA basique.',
    price: 4900, // 49€
  },
  {
    name: 'Pro',
    key: 'pro',
    description: 'Pour les entreprises en croissance. 50 offres, Analytics et Matching Avancé.',
    price: 12900, // 129€
  },
  {
    name: 'Enterprise',
    key: 'enterprise',
    description: 'Recrutement illimité, Support Dédié et accès prioritaire.',
    price: 39900, // 399€
  }
];

/**
 * Auto-génération des Produits et Prix sur Stripe
 * Appelé au démarrage du serveur
 */
const initStripeProducts = async () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.warn('STRIPE_SECRET_KEY non fournie, auto-génération Stripe ignorée.');
    return;
  }

  try {
    logger.info('🔄 Vérification des produits Stripe...');
    
    // Récupérer les produits actifs
    const { data: products } = await stripe.products.list({ active: true, limit: 100 });
    
    for (const plan of PLANS) {
      // Chercher si le produit existe déjà par son nom
      let product = products.find(p => p.name === `NovaWork ${plan.name}`);
      
      if (!product) {
        // Créer le produit
        logger.info(`Création du produit Stripe: NovaWork ${plan.name}`);
        product = await stripe.products.create({
          name: `NovaWork ${plan.name}`,
          description: plan.description,
          metadata: { planKey: plan.key }
        });

        // Créer le prix mensuel pour ce produit
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price,
          currency: 'eur',
          recurring: { interval: 'month' },
        });

        stripePrices[plan.key] = price.id;
        logger.info(`✅ Prix mensuel créé pour ${plan.name}: ${price.id}`);
      } else {
        // Si le produit existe, chercher son prix par défaut
        const { data: prices } = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
        if (prices.length > 0) {
          stripePrices[plan.key] = prices[0].id;
        }
      }
    }
    
    logger.info('✅ Initialisation Stripe terminée. Prices IDs chargés en mémoire.');
  } catch (error) {
    logger.error('❌ Erreur lors de l\'initialisation des produits Stripe :', error.message);
  }
};

module.exports = {
  stripe,
  initStripeProducts,
  stripePrices,
};
