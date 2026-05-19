const cheerio = require('cheerio');

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

/**
 * Fetches a URL, extracts readable text, and splits it into overlapping chunks.
 * Used by the RAG pipeline as the knowledge source.
 */
async function fetchAndChunk(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VoiceAgent-RAG/1.0 (educational project)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} — HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Drop non-content elements
  $('script, style, nav, footer, header, noscript, aside, form').remove();

  // Prefer paragraph text (works well for article-style pages); fall back to body
  let text = $('p')
    .map((_, el) => $(el).text())
    .get()
    .join(' ');

  if (text.trim().length < 500) {
    text = $('body').text();
  }

  text = text.replace(/\s+/g, ' ').trim();

  if (!text) throw new Error(`No readable text extracted from ${url}`);

  return chunkText(text);
}

function chunkText(text) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

module.exports = { fetchAndChunk };
