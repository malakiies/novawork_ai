const winston = require('winston');
const path = require('path');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format console lisible
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack || message}`;
});

// Format fichier JSON
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  defaultMeta: { service: 'novawork-api' },
  transports: [
    // Console — toujours actif
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    }),

    // Fichier erreurs
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level:    'error',
      format:   fileFormat,
    }),

    // Fichier combined (prod)
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format:   fileFormat,
    }),
  ],

  // Capturer les exceptions non gérées
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log'),
    }),
  ],
});

module.exports = logger;
