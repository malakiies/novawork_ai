const PDFDocument = require('pdfkit');
const { cloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');
const { ApiError } = require('../utils/response.utils');
const { PassThrough } = require('stream');

/**
 * Génère un PDF à partir d'un texte et l'uploade sur Cloudinary
 * @param {string} text - Contenu de la lettre
 * @param {string} candidateName - Nom du candidat
 * @returns {Promise<string>} URL Cloudinary du PDF
 */
const generateAndUploadPDF = (text, candidateName) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = new PassThrough();

      // Configurer l'upload Cloudinary via le stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER ? `${process.env.CLOUDINARY_FOLDER}/cover_letters` : 'novawork/cover_letters',
          resource_type: 'raw', // Indispensable pour les PDF non-images
          public_id: `lettre_${candidateName.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            logger.error('Erreur Cloudinary lors de l\'upload du PDF:', error);
            return reject(ApiError.internal('Échec de la sauvegarde du PDF.'));
          }
          resolve(result.secure_url);
        }
      );

      // Connecter PDFKit au stream Cloudinary
      doc.pipe(stream);
      stream.pipe(uploadStream);

      // --- Mise en page du PDF ---
      doc.font('Helvetica-Bold').fontSize(16).text('Lettre de Motivation', { align: 'center' });
      doc.moveDown(2);
      
      doc.font('Helvetica').fontSize(11).text(text, {
        align: 'justify',
        lineGap: 4
      });

      // Finaliser le document
      doc.end();

    } catch (error) {
      logger.error('Erreur lors de la génération PDF:', error);
      reject(ApiError.internal('Erreur de génération PDF.'));
    }
  });
};

module.exports = {
  generateAndUploadPDF
};
