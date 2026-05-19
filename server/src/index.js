require('dotenv').config();
const app = require('./app');
const { isIngested, ingestUrl } = require('./services/rag.service');

const PORT = process.env.PORT || 3002;
const RAG_SOURCE_URL = process.env.RAG_SOURCE_URL;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  if (!RAG_SOURCE_URL) {
    console.log('RAG disabled — set RAG_SOURCE_URL in .env to enable the knowledge base.');
    return;
  }

  try {
    if (await isIngested()) {
      console.log('RAG knowledge base already indexed — skipping ingestion.');
    } else {
      console.log(`Ingesting RAG knowledge base from: ${RAG_SOURCE_URL}`);
      const count = await ingestUrl(RAG_SOURCE_URL);
      console.log(`RAG ingestion complete — ${count} chunks indexed.`);
    }
  } catch (err) {
    console.warn('RAG ingestion failed — agent will run without RAG:', err.message);
  }
});
