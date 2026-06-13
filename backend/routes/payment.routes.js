const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireCompany } = require('../middleware/role.middleware');

// Note: La route Webhook (/webhook) est gérée directement dans server.js 
// car elle nécessite express.raw() avant express.json()

// Toutes les autres routes de paiement sont privées et pour les Entreprises
router.use(protect);
router.use(requireCompany);

router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.post('/customer-portal', paymentController.createCustomerPortal);
router.get('/my-billing', paymentController.getBillingInfo);

module.exports = router;
