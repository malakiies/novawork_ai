const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const User = require('../models/User.model'); // Assurez-vous d'avoir ce modèle dispo pour vérif ou copier plus tard

let io;

/**
 * Initialise Socket.io sur le serveur HTTP
 */
const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentification requise'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      // Optionnel: vérifier si l'utilisateur existe en base
      
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Token invalide ou expiré'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connecté : ${socket.id} (User: ${socket.user.id})`);

    // Rejoindre une room privée unique à l'utilisateur
    socket.join(`user_${socket.user.id}`);

    // Rejoindre une room rôle (ex: tous les admins)
    socket.join(`role_${socket.user.role}`);

    // --- COACH IA CHAT STREAMING ---
    socket.on('send_chat_message', async (data) => {
      const { conversationId, content } = data;
      try {
        const Message = require('../models/Message.model');
        const Conversation = require('../models/Conversation.model');
        const aiService = require('../services/ai.service');

        // 1. Sauvegarder le message utilisateur
        await Message.create({
          conversationId,
          userId: socket.user.id,
          role: 'user',
          content
        });

        // 2. Préparer l'historique
        const history = await Message.find({ conversationId })
          .sort('createdAt')
          .select('role content');
        
        const messageHistory = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

        // Optionnel : Récupérer le contexte de la conversation
        const conv = await Conversation.findById(conversationId);
        const systemContext = conv ? conv.systemContext?.candidateSummary : '';

        // 3. Préparer le message IA vide en base
        const aiMessage = new Message({
          conversationId,
          userId: socket.user.id,
          role: 'assistant',
          content: '',
          isStreamed: true
        });

        // 4. Lancer le streaming OpenAI
        const fullReply = await aiService.streamCoachConversation(
          messageHistory,
          systemContext,
          (chunk) => {
            // Émettre le morceau au client
            socket.emit('chat_chunk', { conversationId, chunk });
          }
        );

        // 5. Streaming terminé : on sauvegarde la réponse complète
        socket.emit('chat_complete', { conversationId });
        aiMessage.content = fullReply;
        await aiMessage.save();

      } catch (error) {
        console.error('Erreur Chat Socket:', error);
        socket.emit('chat_error', { message: 'Désolé, une erreur est survenue lors de l\'analyse.' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket déconnecté : ${socket.id}`);
    });
  });

  return io;
};

/**
 * Fonction utilitaire pour envoyer un événement à un utilisateur spécifique
 */
const emitToUser = (userId, eventName, payload) => {
  if (io) {
    io.to(`user_${userId}`).emit(eventName, payload);
  }
};

/**
 * Fonction utilitaire pour envoyer un événement à un rôle spécifique
 */
const emitToRole = (role, eventName, payload) => {
  if (io) {
    io.to(`role_${role}`).emit(eventName, payload);
  }
};

module.exports = {
  initSocket,
  getIo: () => io,
  emitToUser,
  emitToRole,
};
