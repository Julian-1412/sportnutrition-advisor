// Load environment variables from .env before anything else
require('dotenv').config();
const app = require('./app');
const { isIngested, ingestUrl } = require('./services/rag.service');

const PORT = process.env.PORT || 3002;
const RAG_SOURCE_URL = process.env.RAG_SOURCE_URL;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // RAG ingestion runs once on first startup; skipped on subsequent restarts
  // because the Vectra index persists on disk between runs
  if (!RAG_SOURCE_URL) {
    console.log('RAG disabled — set RAG_SOURCE_URL in .env to enable the knowledge base.');
    return;
  }

  try {
    if (await isIngested()) {
      // Index already exists on disk — no need to re-embed all chunks
      console.log('RAG knowledge base already indexed — skipping ingestion.');
    } else {
      console.log(`Ingesting RAG knowledge base from: ${RAG_SOURCE_URL}`);
      const count = await ingestUrl(RAG_SOURCE_URL);
      console.log(`RAG ingestion complete — ${count} chunks indexed.`);
    }
  } catch (err) {
    // Non-fatal: the agent keeps working without RAG context
    console.warn('RAG ingestion failed — agent will run without RAG:', err.message);
  }
});
