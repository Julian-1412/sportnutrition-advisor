const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AUDIOS_DIR = path.join(__dirname, '../../audios');

async function synthesize(text) {
  const filename = `response-${uuidv4()}.mp3`;
  const filePath = path.join(AUDIOS_DIR, filename);

  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova',
    input: text,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/audios/${filename}`;
}

module.exports = { synthesize };
