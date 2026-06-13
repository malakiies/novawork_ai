const express = require('express');
const router = express.Router();

const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Toutes les routes Chat IA sont privées
router.use(protect);

router.get('/', chatController.getConversations);
router.post('/', chatController.createConversation);
router.get('/:id/messages', chatController.getConversationMessages);

module.exports = router;
