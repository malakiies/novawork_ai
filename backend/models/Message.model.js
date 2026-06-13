const mongoose = require('mongoose');

/**
 * @collection messages
 * @description Messages individuels dans une conversation IA.
 *              Stocke les échanges user/assistant avec les métadonnées OpenAI.
 */
const messageSchema = new mongoose.Schema(
  {
    // ─── Référence conversation ──────────────────────────────────────────────
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'La conversation est obligatoire'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // ─── Contenu du message ──────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant', 'system'],
        message: 'Rôle invalide : {VALUE}',
      },
      required: [true, 'Le rôle est obligatoire'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Le contenu est obligatoire'],
      maxlength: [20000, 'Message trop long'],
    },

    // ─── Pièces jointes / Références ─────────────────────────────────────────
    attachments: {
      type: [
        {
          type:     { type: String, enum: ['cv', 'job', 'cover_letter'] },
          refId:    { type: mongoose.Schema.Types.ObjectId },
          label:    { type: String },
        },
      ],
      default: [],
    },

    // ─── Métadonnées OpenAI ──────────────────────────────────────────────────
    openai: {
      model:            { type: String, default: null },      // ex: "gpt-4o"
      promptTokens:     { type: Number, default: 0 },
      completionTokens: { type: Number, default: 0 },
      totalTokens:      { type: Number, default: 0 },
      finishReason:     { type: String, default: null },      // "stop" | "length" | "content_filter"
      responseTime:     { type: Number, default: null },      // ms
    },

    // ─── Feedback utilisateur ─────────────────────────────────────────────────
    feedback: {
      rating:  { type: Number, min: 1, max: 5, default: null },
      flagged: { type: Boolean, default: false },
      comment: { type: String, maxlength: 500, default: null },
    },

    // ─── Statut ──────────────────────────────────────────────────────────────
    isError: {
      type: Boolean,
      default: false,
    },
    errorDetails: {
      type: String,
      default: null,
    },
    isStreamed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────────────────────
messageSchema.index({ conversationId: 1, createdAt: 1 }); // Lecture chronologique
messageSchema.index({ userId: 1, createdAt: -1 });
messageSchema.index({ 'feedback.flagged': 1 }, { sparse: true }); // Admin review

// ─── Post-save : mise à jour stats conversation ───────────────────────────────
messageSchema.post('save', async function () {
  try {
    await mongoose.model('Conversation').findByIdAndUpdate(this.conversationId, {
      $inc: {
        messageCount: 1,
        totalTokensUsed: this.openai?.totalTokens || 0,
      },
      $set: { lastMessageAt: this.createdAt },
    });
  } catch (err) {
    console.error('Erreur mise à jour conversation stats:', err.message);
  }
});

module.exports = mongoose.model('Message', messageSchema);
