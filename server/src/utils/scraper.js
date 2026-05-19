const cheerio = require('cheerio');

// Target chunk size in characters — balances context quality vs. embedding cost
const CHUNK_SIZE = 1000;
// Overlap between consecutive chunks so context is not lost at chunk boundaries
const CHUNK_OVERLAP = 150;

// Fetches a URL, strips non-content HTML elements, extracts readable text,
// and returns it as an array of overlapping text chunks ready for embedding.
async function fetchAndChunk(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VoiceAgent-RAG/1.0 (educational project)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url} — HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove layout and interactive elements that contain no useful knowledge
  $('script, style, nav, footer, header, noscript, aside, form').remove();

  // Paragraph tags capture the main article content on most sites.
  // Falling back to full body text handles pages without clear <p> structure.
  let text = $('p')
    .map((_, el) => $(el).text())
    .get()
    .join(' ');

  if (text.trim().length < 500) {
    text = $('body').text();
  }

  // Collapse whitespace so chunk boundaries are predictable
  text = text.replace(/\s+/g, ' ').trim();

  if (!text) throw new Error(`No readable text extracted from ${url}`);

  return chunkText(text);
}

// Splits a long string into overlapping fixed-size chunks.
// Overlap ensures that sentences cut by a chunk boundary still appear in full
// in at least one of the two adjacent chunks.
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
