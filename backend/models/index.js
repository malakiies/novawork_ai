/**
 * @file models/index.js
 * @description Point d'entrée unique pour tous les modèles Mongoose.
 *              Importer depuis ce fichier plutôt que depuis chaque modèle individuellement.
 *
 * Usage:
 *   const { User, Job, Application } = require('./models');
 */

module.exports = {
  User:             require('./User.model'),
  CandidateProfile: require('./CandidateProfile.model'),
  Company:          require('./Company.model'),
  Job:          require('./Job.model'),
  Application:  require('./Application.model'),
  CV:           require('./CV.model'),
  AIAnalysis:   require('./AIAnalysis.model'),
  CoverLetter:  require('./CoverLetter.model'),
  Conversation: require('./Conversation.model'),
  Message:      require('./Message.model'),
  Payment:      require('./Payment.model'),
  Notification: require('./Notification.model'),
};
