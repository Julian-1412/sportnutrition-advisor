const path = require('path');
const { LocalIndex } = require('vectra');
const OpenAI = require('openai');
const { fetchAndChunk } = require('../utils/scraper');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

// Local file-based vector database (Vectra)
const INDEX_PATH = path.join(__dirname, '../../vector-index');
const index = new LocalIndex(INDEX_PATH);

// Minimum cosine similarity for a chunk to be considered relevant
const SIMILARITY_THRESHOLD = 0.3;

async function embed(text) {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
  return res.data[0].embedding;
}

/** True if the vector index exists and contains at least one chunk. */
async function isIngested() {
  if (!(await index.isIndexCreated())) return false;
  const items = await index.listItems();
  return items.length > 0;
}

/**
 * Scrapes the given URL, chunks the text, embeds each chunk, and stores the
 * vectors in the local vector database. Replaces any previously indexed data.
 */
async function ingestUrl(url) {
  if (await index.isIndexCreated()) {
    await index.deleteIndex();
  }
  await index.createIndex();

  const chunks = await fetchAndChunk(url);

  for (const chunk of chunks) {
    const vector = await embed(chunk);
    await index.insertItem({ vector, metadata: { text: chunk, source: url } });
  }

  return chunks.length;
}

/**
 * Embeds the query and returns the top-k most relevant chunks from the
 * knowledge base, filtered by a minimum similarity score.
 */
async function retrieve(query, k = 3) {
  if (!(await isIngested())) return [];

  const vector = await embed(query);
  const results = await index.queryItems(vector, query, k);

  return results
    .filter((r) => r.score >= SIMILARITY_THRESHOLD)
    .map((r) => ({
      text: r.item.metadata.text,
      source: r.item.metadata.source,
      score: r.score,
    }));
}

module.exports = { ingestUrl, retrieve, isIngested };
