const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Directory where generated audio files are saved and served from
const AUDIOS_DIR = path.join(__dirname, '../../audios');

// Converts a text string to speech using OpenAI TTS, saves the audio as an .mp3
// file, and returns the public URL path that the frontend can play.
async function synthesize(text) {
  // Generate a unique filename to avoid collisions between concurrent requests
  const filename = `response-${uuidv4()}.mp3`;
  const filePath = path.join(AUDIOS_DIR, filename);

  // Call OpenAI TTS with the 'nova' voice (natural, clear, gender-neutral)
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  });

  // Convert the response stream to a Buffer and write it to disk synchronously
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Return the relative URL — Express serves /audios/* as static files
  return `/audios/${filename}`;
}

module.exports = { synthesize };
