const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const { sendSuccess, ApiError } = require('../utils/response.utils');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Lister les conversations de l'utilisateur
 * @route   GET /api/v1/chat
 * @access  Privé
 */
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user._id, isArchived: false })
    .sort('-lastMessageAt -createdAt');
  return sendSuccess(res, { conversations });
});

/**
 * @desc    Créer une nouvelle conversation
 * @route   POST /api/v1/chat
 * @access  Privé
 */
const createConversation = asyncHandler(async (req, res) => {
  const { title, context } = req.body;
  const conversation = await Conversation.create({
    userId: req.user._id,
    title: title || 'Nouvelle discussion',
    context: context || 'general',
    lastMessageAt: new Date()
  });
  return sendSuccess(res, { conversation }, 'Conversation créée', 201);
});

/**
 * @desc    Récupérer l'historique des messages d'une conversation
 * @route   GET /api/v1/chat/:id/messages
 * @access  Privé
 */
const getConversationMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
  if (!conversation) throw ApiError.notFound('Conversation introuvable');

  const messages = await Message.find({ conversationId: req.params.id })
    .sort('createdAt') // Chronologique
    .select('-openai'); // Ne pas envoyer les tokens au frontend pour rien

  return sendSuccess(res, { conversation, messages });
});

module.exports = {
  getConversations,
  createConversation,
  getConversationMessages,
};
