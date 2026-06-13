const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @collection users
 * @description Compte racine commun à tous les rôles (candidat, entreprise, admin).
 *              L'identité spécifique au rôle est dans CompanyProfile ou CandidateProfile.
 */
const userSchema = new mongoose.Schema(
  {
    // ─── Identité ────────────────────────────────────────────────────────────
    email: {
      type: String,
      required: [true, 'L\'email est obligatoire'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Format email invalide'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Minimum 8 caractères'],
      select: false, // jamais renvoyé dans les queries par défaut
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'company', 'admin'],
        message: 'Rôle invalide : {VALUE}',
      },
      required: [true, 'Le rôle est obligatoire'],
      index: true,
    },

    // ─── Statut du compte ────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },

    // ─── Tokens sécurité ─────────────────────────────────────────────────────
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    // ─── Métadonnées ─────────────────────────────────────────────────────────
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },
    avatar: {
      type: String, // URL Cloudinary
      default: null,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'Prénom trop long'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Nom trop long'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-().]{7,20}$/, 'Numéro de téléphone invalide'],
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index composés ──────────────────────────────────────────────────────────
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// ─── Virtuals ────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
  return this.firstName || this.lastName || '';
});

// ─── Middleware Pre-save : hashage password ───────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Méthodes d'instance ─────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
