const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'novawork_ai',
    });

    isConnected = true;
    logger.info(`✅ MongoDB connecté : ${conn.connection.host} | DB: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB erreur : ${err.message}`);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB déconnecté');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnecté');
      isConnected = true;
    });

  } catch (error) {
    logger.error(`❌ MongoDB échec connexion : ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
