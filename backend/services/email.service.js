const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifier la connexion SMTP au démarrage
const testSmtpConnection = async () => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await transporter.verify();
      logger.info('✅ SMTP connecté : prêt à envoyer des emails');
    }
  } catch (error) {
    logger.error(`⚠️  SMTP Erreur: ${error.message}`);
  }
};

/**
 * Fonction générique pour envoyer un email
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.debug(`Email envoyé à ${to} [${info.messageId}]`);
    return info;
  } catch (error) {
    logger.error(`Erreur envoi email à ${to} : ${error.message}`);
    // On ne jette pas l'erreur pour ne pas bloquer le flow (ex: inscription)
    return null;
  }
};

/**
 * Emails spécifiques
 */

const sendVerificationEmail = async (email, name, verifyUrl) => {
  const subject = 'Vérifiez votre adresse email — NovaWork AI';
  const html = `
    <h1>Bienvenue sur NovaWork AI, ${name || ''} !</h1>
    <p>Merci de vous être inscrit. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
    <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
      Vérifier mon email
    </a>
    <p>Ce lien est valable 24 heures.</p>
    <p>Si vous n'avez pas créé ce compte, ignorez cet email.</p>
  `;
  return sendEmail({ to: email, subject, html });
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = 'Réinitialisation de votre mot de passe — NovaWork AI';
  const html = `
    <h1>Réinitialisation de mot de passe</h1>
    <p>Bonjour ${name || ''},</p>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
    <a href="${resetUrl}" style="padding: 10px 20px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 5px;">
      Réinitialiser le mot de passe
    </a>
    <p>Ce lien expire dans 1 heure.</p>
    <p>Si vous n'avez pas fait cette demande, votre compte est sécurisé et vous pouvez ignorer cet email.</p>
  `;
  return sendEmail({ to: email, subject, html });
};

module.exports = {
  testSmtpConnection,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
