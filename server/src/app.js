const express = require('express');
const cors = require('cors');
const path = require('path');
const chatRoutes = require('./routes/chat.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve generated audio files statically
app.use('/audios', express.static(path.join(__dirname, '../audios')));

app.use('/api', chatRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
