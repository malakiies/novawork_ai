const Notification = require('../models/Notification.model');
const { emitToUser } = require('../sockets/socket.manager');
const logger = require('../utils/logger');

/**
 * Service centralisé pour l'envoi de notifications
 * Sauvegarde en DB et émission via Socket.io
 */
class NotificationService {
  /**
   * Envoyer une notification à un utilisateur
   * @param {Object} params
   * @param {string} params.userId - ID du destinataire
   * @param {string} params.type - Type de la notification (ex: 'payment_success')
   * @param {string} params.title - Titre affiché
   * @param {string} params.body - Corps du message
   * @param {string} [params.icon] - Icône (emoji ou nom)
   * @param {string} [params.actionUrl] - Lien (ex: '/company/billing')
   * @param {Object} [params.metadata] - Données additionnelles
   */
  async send({ userId, type, title, body, icon = '🔔', actionUrl = null, metadata = {} }) {
    try {
      // 1. Sauvegarder en DB
      const notification = await Notification.create({
        userId,
        type,
        title,
        body,
        icon,
        actionUrl,
        metadata,
        isDelivered: true,
        deliveredAt: new Date()
      });

      // 2. Émettre en temps réel via Socket.io
      emitToUser(userId, 'new_notification', notification);

      return notification;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification :', error);
      // On ne throw pas l'erreur pour ne pas bloquer les processus principaux (ex: webhook)
      return null;
    }
  }

  // Raccourcis pour des événements spécifiques

  async notifyPaymentSuccess(userId, amount, invoiceUrl) {
    return this.send({
      userId,
      type: 'payment_success',
      title: 'Paiement réussi',
      body: `Votre paiement de ${(amount / 100).toFixed(2)}€ a été traité avec succès.`,
      icon: '💸',
      actionUrl: '/company/billing',
      metadata: { invoiceUrl }
    });
  }

  async notifyCvAnalysisDone(userId, cvId) {
    return this.send({
      userId,
      type: 'cv_analysis_done',
      title: 'Analyse IA terminée',
      body: 'L\'intelligence artificielle a terminé l\'analyse de votre CV.',
      icon: '✨',
      actionUrl: '/candidate/cvs',
      metadata: { cvId }
    });
  }

  async notifyNewMessage(userId, conversationId) {
    return this.send({
      userId,
      type: 'new_message',
      title: 'Nouveau message IA',
      body: 'Vous avez reçu une nouvelle réponse de votre Coach IA.',
      icon: '💬',
      actionUrl: '/candidate/chat',
      metadata: { conversationId }
    });
  }
}

module.exports = new NotificationService();
