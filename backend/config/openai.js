const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODELS = {
  chat:      process.env.OPENAI_CHAT_MODEL      || 'gpt-4o',
  embedding: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
};

module.exports = { openai, MODELS };
