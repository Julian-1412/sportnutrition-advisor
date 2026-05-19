const { Router } = require('express');
const { handleChat } = require('../controllers/chat.controller');

const router = Router();

router.post('/chat', handleChat);

module.exports = router;
