const { Router } = require('express');
const { handleChat } = require('../controllers/chat.controller');

const router = Router();

// Single endpoint: receives user messages and returns the agent's response
router.post('/chat', handleChat);

module.exports = router;
