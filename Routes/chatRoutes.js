const express=  require('express');
const router = express.Router();
const verifyAccessToken = require('../Middleware/authMiddleware');
const chatController = require('../utils/Controllers/chat.controller');

router.get('/room/chats', verifyAccessToken, chatController.getChatMessagesByRoom);

router.get('/chat', verifyAccessToken, chatController.fetchConversation);

router.put('/room/:id', verifyAccessToken, chatController.deleteSelectedChatRoom);

module.exports = router;