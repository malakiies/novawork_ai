const multer = require('multer');
const path   = require('path');
const { ApiError }     = require('../utils/response.utils');
const { UPLOAD_LIMITS } = require('../config/constants');

// ─── Stockage mémoire (stream vers Cloudinary) ────────────────────────────────
const memoryStorage = multer.memoryStorage();

// ─── Filtre CV (PDF / DOCX) ──────────────────────────────────────────────────
const cvFileFilter = (req, file, cb) => {
  if (UPLOAD_LIMITS.ALLOWED_CV_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Format non supporté. Utilisez PDF ou DOCX'), false);
  }
};

// ─── Filtre Image (JPG, PNG, WebP) ───────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  if (UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Format image non supporté. Utilisez JPG, PNG ou WebP'), false);
  }
};

// ─── Upload CV ────────────────────────────────────────────────────────────────
const uploadCV = multer({
  storage:  memoryStorage,
  fileFilter: cvFileFilter,
  limits: { fileSize: UPLOAD_LIMITS.CV_MAX_SIZE },
}).single('cv');

// ─── Upload Image (avatar, logo) ─────────────────────────────────────────────
const uploadImage = multer({
  storage:    memoryStorage,
  fileFilter: imageFileFilter,
  limits:     { fileSize: UPLOAD_LIMITS.IMAGE_MAX_SIZE },
}).single('image');

// ─── Wrapper middleware gérant les erreurs Multer ─────────────────────────────
const handleMulterError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest(`Fichier trop volumineux (max ${UPLOAD_LIMITS.CV_MAX_SIZE / 1024 / 1024} Mo)`));
      }
      return next(ApiError.badRequest(`Erreur upload : ${err.message}`));
    }
    next(err);
  });
};

module.exports = {
  uploadCV:    handleMulterError(uploadCV),
  uploadImage: handleMulterError(uploadImage),
};
