const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { cloudinary } = require('../config/cloudinary');
const { ApiError } = require('../utils/response.utils');
const logger = require('../utils/logger');

/**
 * Upload CV vers Cloudinary depuis un buffer
 * @param {Buffer} fileBuffer - Le buffer du fichier Multer
 * @param {string} originalName - Nom original pour Cloudinary
 * @returns {Promise<Object>} URL et PublicID
 */
const uploadCVToCloudinary = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'novawork/cvs',
        resource_type: 'raw', // Pour PDF/DOCX
        use_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) {
          logger.error('Erreur Cloudinary:', error);
          return reject(ApiError.internal('Échec de l\'upload du fichier'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // Pipeline du buffer vers stream Cloudinary
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Extrait le texte d'un fichier CV en mémoire (Buffer)
 * @param {Buffer} buffer - Fichier
 * @param {string} mimetype - Type MIME
 * @returns {Promise<string>} Texte extrait
 */
const extractTextFromBuffer = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } 
    
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    throw new Error('Type de fichier non supporté pour l\'extraction');
  } catch (error) {
    logger.error('Erreur extraction texte CV:', error);
    throw ApiError.internal('Impossible de lire le contenu du fichier');
  }
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    logger.warn(`Échec de suppression Cloudinary: ${publicId}`);
  }
};

module.exports = {
  uploadCVToCloudinary,
  extractTextFromBuffer,
  deleteFromCloudinary,
};
