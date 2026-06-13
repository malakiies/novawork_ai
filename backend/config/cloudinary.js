const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

// Tester la configuration au démarrage
const testCloudinary = async () => {
  try {
    await cloudinary.api.ping();
    logger.info('✅ Cloudinary connecté');
  } catch (error) {
    logger.error(`⚠️  Cloudinary: ${error.message}`);
  }
};

module.exports = { cloudinary, testCloudinary };
