# 🤖 Context Aggregation Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)

> AI-powered context collection and summarization using vector search and LLM inference

A hackathon-ready application that aggregates context from Slack, Google Docs, and web pages, stores it in a vector database, and generates intelligent summaries using state-of-the-art LLM technology.

**GitHub**: [https://github.com/joshleichtung/context-aggregation-agent](https://github.com/joshleichtung/context-aggregation-agent)

## 🎯 Features

- **Multi-Source Context Collection**: Seamlessly gather information from:
  - 💬 Slack channels (via ACI.dev)
  - 📄 Google Docs (via ACI.dev)
  - 🌐 Web pages (direct fetch)

- **Semantic Vector Search**: Powered by Weaviate for intelligent, context-aware retrieval

- **AI-Powered Summarization**: Generate concise summaries using FriendliAI's high-performance inference

- **Observability**: Full LLM call tracing and evaluation metrics via Comet/Opik

- **Modern Stack**: Next.js 14, React 18, TypeScript 5.2, Express, and Tailwind CSS

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js   │────▶│   Express    │────▶│  Weaviate   │
│  Frontend   │     │   Backend    │     │  Vector DB  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         ┌──────▼────┐ ┌──▼─────┐ ┌──▼─────────┐
         │  ACI.dev  │ │Friendli│ │Comet/Opik  │
         │  Tools    │ │  AI    │ │Observ.     │
         └───────────┘ └────────┘ └────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Weaviate instance (cloud or local Docker)

### Installation

```bash
# Clone the repository
git clone https://github.com/joshleichtung/context-aggregation-agent.git
cd context-aggregation-agent

# Install dependencies
pnpm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# Edit .env files with your API keys
```

### Running Locally

```bash
# Start both frontend and backend
pnpm dev

# Or run separately
cd packages/backend && pnpm dev  # Backend on :3001
cd packages/frontend && pnpm dev # Frontend on :3000
```

## 🔧 Configuration

### Backend Environment Variables

Create `packages/backend/.env`:

```env
# Server
PORT=3001

# Weaviate
WEAVIATE_SCHEME=http
WEAVIATE_HOST=localhost:8080
WEAVIATE_API_KEY=your-weaviate-api-key

# ACI.dev (Tool Governance)
ACI_BASE_URL=https://api.aci.dev
ACI_API_KEY=your-aci-api-key

# FriendliAI (Inference)
FRIENDLIAI_BASE_URL=https://api.friendli.ai/v1
FRIENDLIAI_API_KEY=your-friendliai-api-key
FRIENDLIAI_MODEL=mistral-7b-instruct

# Comet/Opik (Observability)
OPIK_BASE_URL=https://api.comet.com/opik
OPIK_API_KEY=your-opik-api-key
OPIK_PROJECT_NAME=context-aggregation-agent
```

### Frontend Environment Variables

Create `packages/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📚 API Documentation

### POST `/api/collect`

Collect context from a source and store it in Weaviate.

```json
{
  "sourceType": "slack",
  "sourceId": "C1234567890",
  "tags": ["project-x", "planning"]
}
```

### GET `/api/search`

Search for context items using semantic search.

```
GET /api/search?query=project updates&limit=10&tags=project-x
```

### POST `/api/summarize`

Generate a summary from collected context.

```json
{
  "topic": "Q1 Planning",
  "query": "planning discussions",
  "tags": ["planning"],
  "limit": 10
}
```

### GET `/api/summarize/:id`

Retrieve a previously generated summary.

```
GET /api/summarize/123e4567-e89b-12d3-a456-426614174000
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.2 |
| **Styling** | Tailwind CSS 3.3, shadcn/ui v0.3.x |
| **Backend** | Node.js 18, Express 4 |
| **Vector DB** | Weaviate (text2vec-transformers) |
| **Tool Access** | ACI.dev |
| **Inference** | FriendliAI |
| **Observability** | Comet/Opik |
| **Validation** | Zod |
| **Testing** | Jest, React Testing Library, Playwright |
| **Package Manager** | pnpm (workspaces) |

## 🗄️ Data Models

### ContextItem

```typescript
{
  id: string;              // UUID
  sourceType: 'slack' | 'google_doc' | 'web';
  sourceId: string;        // Channel/Doc ID or URL
  content: string;         // Raw text content
  metadata: {
    author?: string;
    timestamp?: string;
    title?: string;
  };
  tags: string[];
}
```

### Summary

```typescript
{
  id: string;              // UUID
  topic: string;
  summaryText: string;
  relatedContextIds: string[];
  createdAt?: string;
}
```

## 🧪 Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
cd packages/backend && pnpm build
cd packages/frontend && pnpm build
```

### Linting

```bash
pnpm lint
```

## 🚢 Deployment

### Backend

The backend can be deployed to:
- Vercel (serverless functions)
- Docker container (Railway, Fly.io, etc.)
- Traditional VPS (with PM2)

### Frontend

Deploy to Vercel with automatic CI/CD:

```bash
vercel
```

### Weaviate

Use Weaviate Cloud for managed hosting or deploy via Docker:

```bash
docker run -d \
  -p 8080:8080 \
  -e ENABLE_MODULES='text2vec-transformers' \
  semitechnologies/weaviate:latest
```

## 🔐 Security & Governance

- **ACI.dev Integration**: Fine-grained permissions and OAuth flows for Slack and Google Workspace
- **API Key Management**: All sensitive credentials stored as environment variables
- **Encrypted Transit**: HTTPS/TLS for all API communications
- **Audit Logging**: Complete trace of all tool invocations via ACI.dev

## 📊 Observability

All LLM calls are instrumented with Comet/Opik:

- **Traces**: Input/output logging for every summarization
- **Metrics**: Relevance, hallucination, and context precision scores
- **Performance**: Latency and token usage tracking
- **Debugging**: Full request/response inspection

## 🎯 Use Cases

1. **Team Context Sync**: Aggregate discussions before important meetings
2. **Project Documentation**: Automatically compile project updates from multiple sources
3. **Knowledge Base**: Build searchable context repositories with semantic search
4. **Smart Summaries**: Generate executive summaries from lengthy threads

## 🤝 Contributing

This is a hackathon project! Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Weaviate](https://weaviate.io) - Vector database
- [ACI.dev](https://aci.dev) - Tool governance and access
- [FriendliAI](https://friendli.ai) - LLM inference
- [Comet/Opik](https://www.comet.com) - ML observability
- [shadcn/ui](https://ui.shadcn.com) - UI components

## 📧 Contact

Built for hackathons and learning. Questions? Open an issue!

---

**Made with ❤️ using Next.js, Weaviate, and FriendliAI**
