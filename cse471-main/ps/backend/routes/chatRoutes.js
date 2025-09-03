const express = require('express');
const router = express.Router();
const {
    checkChatExists,
    getOrCreateChat,
    getChatById,
    getUserChats,
    getChatMessages,
    markMessagesAsRead
} = require('../controllers/chatController');


// Get all chats for current user
router.get('/chats', getUserChats);

// Check if chat exists for a pet (without creating)
router.get('/chat/check/:petId', checkChatExists);

// Get or create chat for a pet
router.get('/chat/pet/:petId', getOrCreateChat);

// Get messages for a specific chat
router.get('/chat/:chatId/messages', getChatMessages);

// Mark messages as read
router.put('/chat/:chatId/read', markMessagesAsRead);

// Get specific chat by chatId (must be last to avoid conflicts)
router.get('/chat/:chatId', getChatById);

module.exports = router;
