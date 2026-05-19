require('dotenv').config();
const { ingestUrl } = require('../services/rag.service');

/**
 * Manual RAG ingestion script.
 * Usage: npm run ingest [url]
 * Falls back to RAG_SOURCE_URL from .env when no url argument is given.
 */
async function main() {
  const url = process.argv[2] || process.env.RAG_SOURCE_URL;

  if (!url) {
    console.error('No URL provided. Pass one as an argument or set RAG_SOURCE_URL in .env');
    process.exit(1);
  }

  console.log(`Ingesting knowledge base from: ${url}`);
  const count = await ingestUrl(url);
  console.log(`Done — ${count} chunks embedded and indexed.`);
}

main().catch((err) => {
  console.error('Ingestion failed:', err.message);
  process.exit(1);
});
