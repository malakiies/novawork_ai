const Notification = require('../models/Notification.model');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Récupérer les notifications de l'utilisateur
 * @route   GET /api/v1/notifications
 * @access  Privé
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort('-createdAt')
    .limit(50); // Limiter aux 50 dernières

  const unreadCount = await Notification.countUnread(req.user._id);

  return sendSuccess(res, { notifications, unreadCount });
});

/**
 * @desc    Marquer une notification comme lue
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Privé
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
  if (!notification) throw ApiError.notFound('Notification introuvable');

  await notification.markAsRead();
  return sendSuccess(res, { notification });
});

/**
 * @desc    Marquer toutes les notifications comme lues
 * @route   PUT /api/v1/notifications/read-all
 * @access  Privé
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return sendSuccess(res, null, 'Toutes les notifications ont été marquées comme lues.');
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
