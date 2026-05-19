const path = require('path');
const { LocalIndex } = require('vectra');
const OpenAI = require('openai');
const { fetchAndChunk } = require('../utils/scraper');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

// Vectra stores vectors as a JSON file on disk — no separate database server needed
const INDEX_PATH = path.join(__dirname, '../../vector-index');
const index = new LocalIndex(INDEX_PATH);

// Chunks with a cosine similarity below this threshold are considered irrelevant
const SIMILARITY_THRESHOLD = 0.3;

// Converts a text string into a vector using OpenAI's embedding model
async function embed(text) {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
  return res.data[0].embedding;
}

// Returns true if the vector index exists on disk and has at least one item.
// Used at startup to decide whether to skip re-ingestion.
async function isIngested() {
  if (!(await index.isIndexCreated())) return false;
  const items = await index.listItems();
  return items.length > 0;
}

// Fetches and chunks the content of a URL, embeds every chunk, and stores
// the vectors in the local Vectra index. Deletes any existing index first
// so re-ingestion always produces a clean, consistent dataset.
async function ingestUrl(url) {
  if (await index.isIndexCreated()) {
    await index.deleteIndex();
  }
  await index.createIndex();

  const chunks = await fetchAndChunk(url);

  for (const chunk of chunks) {
    const vector = await embed(chunk);
    // Store both the vector and the original text so we can return it as context
    await index.insertItem({ vector, metadata: { text: chunk, source: url } });
  }

  return chunks.length;
}

// Embeds the user's query and finds the top-k most similar chunks in the index.
// Filters out low-relevance results using the similarity threshold.
async function retrieve(query, k = 3) {
  // Skip retrieval if nothing has been ingested yet
  if (!(await isIngested())) return [];

  const vector = await embed(query);
  // queryItems returns results sorted by descending cosine similarity
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
