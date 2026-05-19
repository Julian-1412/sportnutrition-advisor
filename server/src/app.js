const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Allow requests from the React frontend running on a different port
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve generated TTS audio files so the browser can play them directly
app.use('/audios', express.static(path.join(__dirname, '../audios')));

// Mount all chat-related endpoints under /api
app.use('/api', chatRoutes);

// Catch-all error handler — returns a JSON error instead of crashing the process
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
