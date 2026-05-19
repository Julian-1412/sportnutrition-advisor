# SportsNutrition Advisor

> An AI-powered multimodal sports nutrition coaching assistant — ask questions by text, get answers in text or voice, backed by real tools and a RAG knowledge base.

---

## Use Case

**SportsNutrition Advisor** is a conversational web application where users interact with an AI agent specialized in sports nutrition. The agent can calculate personalized macros, look up evidence-based supplement information, and answer general questions grounded in a curated knowledge base.

The agent is built to behave like a knowledgeable but responsible nutrition coach: it uses tools when precision is needed, retrieves relevant knowledge before answering, maintains conversation context, and always clarifies that its responses are informational and not a substitute for professional advice.

---

## Technologies

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 8 |
| Backend | Node.js 18+ + Express 5 |
| AI Agent | OpenAI Chat Completions API with tool calling |
| TTS | OpenAI TTS (`tts-1`, voice: `nova`) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Vector Database | Vectra (local file-based vector store) |
| Session Memory | In-memory store, last 7 messages per session |
| Web Scraping | Cheerio |

---

## Project Structure

```
voiceagent-app/
│
├── package.json              # Root — single command to run everything
│
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx           # Root component, session state, suggestion chips
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx         # Conversation history + empty state
│   │   │   ├── MessageBubble.jsx      # Single message with avatar + tool badge
│   │   │   ├── ChatInput.jsx          # Textarea + send button
│   │   │   ├── ResponseModeToggle.jsx # Text / Voice switcher
│   │   │   ├── ToolBadge.jsx          # Persistent tool indicator
│   │   │   └── AudioPlayer.jsx        # Auto-playing audio for voice mode
│   │   ├── services/
│   │   │   └── api.js        # All fetch calls to the backend
│   │   └── styles/
│   │       └── app.css       # Full UI stylesheet
│   └── .env.example
│
└── server/                   # Node.js + Express backend
    ├── src/
    │   ├── index.js          # Server entry point + RAG auto-ingestion on startup
    │   ├── app.js            # Express app, CORS, static audio serving
    │   ├── routes/
    │   │   └── chat.routes.js         # POST /api/chat
    │   ├── controllers/
    │   │   └── chat.controller.js     # Request orchestration
    │   ├── services/
    │   │   ├── agent.service.js       # LLM loop + RAG context injection
    │   │   ├── memory.service.js      # Session memory (7-message window)
    │   │   ├── rag.service.js         # Vector DB: embed, store, retrieve
    │   │   └── tts.service.js         # Text-to-speech synthesis
    │   ├── tools/
    │   │   ├── calculateMacros.js     # Macro calculation tool
    │   │   └── searchSupplements.js   # Supplement knowledge tool
    │   ├── utils/
    │   │   ├── toolRegistry.js        # Maps tool names to handlers
    │   │   └── scraper.js             # Fetch URL + extract + chunk text
    │   ├── prompts/
    │   │   └── systemPrompt.js        # Agent persona and rules
    │   └── scripts/
    │       └── ingest.js              # Manual RAG ingestion script
    ├── audios/               # Generated .mp3 files for voice responses
    ├── vector-index/         # Vectra vector database (auto-generated)
    └── .env.example
```

---

## Installation

### Prerequisites

- Node.js 18 or higher
- An OpenAI API key (required for the agent, TTS, and embeddings)

### 1. Unzip and enter the project

```bash
cd voiceagent-app
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Open `server/.env` and fill in your `OPENAI_API_KEY`. All other variables have sensible defaults.

### 3. Install all dependencies

```bash
npm run install:all
```

This installs dependencies for the root, the server, and the client in one command.

---

## Running the Application

```bash
npm run dev
```

This single command starts both the backend and frontend simultaneously using `concurrently`.

| Service | URL |
|---------|-----|
| Frontend (chat UI) | http://localhost:5173 |
| Backend (API) | http://localhost:3002 |

On first startup, the server automatically scrapes and indexes the RAG knowledge base from the configured URL. You will see this in the terminal:

```
Ingesting RAG knowledge base from: https://en.wikipedia.org/wiki/Sports_nutrition
RAG ingestion complete — 17 chunks indexed.
```

Subsequent starts reuse the persisted index and skip re-ingestion.

---

## Environment Variables

### `server/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Backend server port |
| `OPENAI_API_KEY` | *(required)* | Your OpenAI secret key |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Chat model used by the agent |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | Model used to generate RAG embeddings |
| `TTS_PROVIDER` | `openai` | TTS provider: `openai` or `elevenlabs` |
| `ELEVENLABS_API_KEY` | — | Only required when using ElevenLabs TTS |
| `RAG_SOURCE_URL` | `https://en.wikipedia.org/wiki/Sports_nutrition` | Page to scrape for the knowledge base. Leave empty to disable RAG. |

### `client/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3002` | Backend base URL |

---

## How the Agent Works

Each time the user sends a message, the backend executes this pipeline:

```
1. Load session memory  →  last 7 messages for this sessionId
2. RAG retrieval        →  embed the user message → find top-3 similar chunks
3. Build context        →  system prompt + RAG chunks + conversation history
4. Call OpenAI          →  gpt-4.1-mini with tool_choice: "auto"
      │
      ├── Model calls a tool?
      │       ├── Execute the tool (calculateMacros or searchSupplements)
      │       ├── Feed result back to the model
      │       └── Loop until the model produces a final text reply
      │
      └── Final reply
5. Save to memory       →  append user + assistant messages, trim to 7
6. TTS (if voice mode)  →  synthesize reply → save .mp3 → return audioUrl
7. Return response      →  { reply, usedTool, toolName, mode, audioUrl }
```

The frontend renders a **tool badge** on any response where `usedTool: true`, and an **audio player** when `audioUrl` is present. Both persist in the chat history.

---

## Tools

The agent has access to two tools and decides autonomously when to use each based on the user's question.

### `calculateMacros`

Estimates daily calorie needs and macronutrient targets using the **Mifflin-St Jeor** formula.

**Parameters:**

| Parameter | Type | Values |
|-----------|------|--------|
| `weight_kg` | number | Body weight in kg |
| `height_cm` | number | Height in cm |
| `age` | number | Age in years |
| `gender` | string | `male` / `female` |
| `activity_level` | string | `sedentary` / `light` / `moderate` / `active` / `very_active` |
| `goal` | string | `lose_weight` / `maintain` / `gain_muscle` |

**Output:** TDEE (Total Daily Energy Expenditure), target calories adjusted for goal, and grams of protein, carbohydrates, and fat.

**Example prompt:**
> *"I'm a 30-year-old male, 80 kg, 178 cm, moderately active, and want to gain muscle. What should my macros be?"*

---

### `searchSupplements`

Looks up evidence-based information about a supplement or ingredient from a curated internal database.

**Parameter:** `supplement_name` (string)

**Output:** Name, category, benefits, typical dose, best timing, safety notes, and evidence level.

**Supported supplements:**

| Supplement | Category |
|------------|----------|
| Creatine Monohydrate | Performance |
| Whey Protein | Protein |
| Caffeine | Stimulant / Performance |
| Beta-Alanine | Performance / Buffer |
| BCAAs | Amino Acids |
| Magnesium | Mineral |
| Vitamin D3 | Vitamin |
| Omega-3 (Fish Oil) | Essential Fat |
| Ashwagandha | Adaptogen |

**Example prompts:**
> *"Tell me about creatine."*
> *"Is beta-alanine safe? What dose should I take?"*
> *"What does ashwagandha do for athletes?"*

---

## Response Modes

The **Text / Voice** toggle in the top-right corner of the UI controls how the agent responds.

| Mode | Behavior |
|------|----------|
| **Text** | Reply appears as a text bubble in the chat |
| **Voice** | Reply is synthesized via OpenAI TTS (`nova` voice) and an audio player appears inside the message bubble, auto-playing the response |

The mode can be changed at any moment during the conversation. Each request sends the currently selected mode, so switching mid-conversation takes effect immediately on the next message.

Voice audio files are saved as `.mp3` in `server/audios/` and served statically at `/audios/<filename>`.

---

## Session Memory

Each browser tab generates a unique `sessionId` (via `crypto.randomUUID()`) that persists for the lifetime of the tab.

The backend stores conversation history per `sessionId` in an in-memory object. On every request:
1. The new user message is added to the session.
2. The history is trimmed to the **last 7 messages**.
3. The full 7-message window is passed to the model as context.

This gives the agent coherent multi-turn conversation without a database.

---

## UI Features

| Feature | Description |
|---------|-------------|
| Chat history | Full scrollable conversation with smooth auto-scroll |
| Suggestion chips | 4 clickable starter prompts shown on the empty state |
| Message avatars | Dumbbell icon for the assistant, person icon for the user |
| Tool badge | Persistent purple pill badge showing which tool was used |
| Typing indicator | Animated green dots while the agent is thinking |
| Audio player | Embedded player for voice responses with auto-play |
| Error banner | Inline error message if the API call fails |
| Mode toggle | Text / Voice switcher with icons, always visible in the header |

---

## System Prompt

The agent's behavior is defined by 7 instructions in `server/src/prompts/systemPrompt.js`:

1. **Role** — Sports nutrition coach specialized in evidence-based advice
2. **Tone** — Clear, encouraging, and professional; concise and actionable
3. **Tool usage** — Must use `calculateMacros` for any macro/calorie question; must use `searchSupplements` for any supplement query
4. **Medical disclaimer** — Never make specific medical claims; defer clinical questions to qualified professionals
5. **Boundaries** — Only answer questions related to sports nutrition, diet, supplementation, and athletic performance
6. **Memory** — Use conversation history to maintain context and reference prior messages
7. **Knowledge base** — When RAG context is injected into the prompt, ground the answer in that material

---

## RAG Knowledge Base

The agent is augmented with a **Retrieval-Augmented Generation (RAG)** pipeline that provides additional domain knowledge beyond the model's training data.

**Default source URL:** `https://en.wikipedia.org/wiki/Sports_nutrition`
*(Configurable via `RAG_SOURCE_URL` in `server/.env`)*

### Pipeline

| Step | Description |
|------|-------------|
| **Scrape** | On first startup, the page is fetched and readable text is extracted with Cheerio (prioritizing `<p>` tags) |
| **Chunk** | Text is split into ~1000-character overlapping chunks (150-char overlap) |
| **Embed** | Each chunk is embedded with `text-embedding-3-small` (1536 dimensions) |
| **Store** | Vectors and metadata are persisted in a local Vectra vector database at `server/vector-index/` |
| **Retrieve** | On every user message, the message is embedded and the top 3 chunks above a cosine similarity threshold of 0.3 are fetched |
| **Augment** | Retrieved chunks are appended to the system prompt as `RELEVANT KNOWLEDGE BASE CONTEXT` before the LLM call |

The index persists between server restarts. Re-ingestion only runs when the index is empty.

### Re-ingesting manually

```bash
npm run ingest                           # re-index using RAG_SOURCE_URL from .env
npm run ingest -- https://example.com    # index a different URL
```

If `RAG_SOURCE_URL` is not set, RAG is silently disabled and the agent runs without it. RAG failures never crash the server — the agent falls back to non-augmented responses.
