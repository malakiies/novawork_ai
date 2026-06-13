require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('./utils/logger');
const connectDB = require('./config/db');
const { testCloudinary } = require('./config/cloudinary');
const { testSmtpConnection } = require('./services/email.service');
const { initSocket } = require('./sockets/socket.manager');
const { initStripeProducts } = require('./config/stripe');
const { errorHandler, notFound } = require('./middleware/errorHandler.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');
const paymentController = require('./controllers/payment.controller');

// Initialiser l'application Express
const app = express();
const server = http.createServer(app);

// Initialiser Socket.io
initSocket(server);

// ─── Middleware Globaux ───────────────────────────────────────────────────────

// Sécurité : Set des headers HTTP sécurisés
app.use(helmet());

// Sécurité : CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // Autoriser les cookies (refresh token)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  })
);

// Limiteur de requêtes global
app.use(apiLimiter);

// ⚠️ STRIPE WEBHOOK (Doit être parsé AVANT express.json)
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Parsing des requêtes
app.use(express.json({ limit: '10kb' })); // Limiter la taille du body pour éviter les attaques DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sécurité : Protéger contre les injections NoSQL
app.use(mongoSanitize());

// Sécurité : Protéger contre le XSS
app.use(xss());

// ─── Routing ──────────────────────────────────────────────────────────────────

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'NovaWork API en cours d\'exécution' });
});

// Montage des routes v1
app.use('/api/v1', routes);

// Gestion 404
app.use(notFound);

// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

// ─── Démarrage du Serveur ─────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connexion DB et tests externes
    await connectDB();
    await testCloudinary();
    await testSmtpConnection();
    await initStripeProducts();

    server.listen(PORT, () => {
      logger.info(`🚀 Serveur démarré en mode ${process.env.NODE_ENV} sur le port ${PORT}`);
    });
  } catch (err) {
    logger.error('Erreur fatale au démarrage:', err);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées globalement
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection! Arrêt du serveur...', { err });
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Arrêt immédiat...', { err });
  process.exit(1);
});

startServer();
