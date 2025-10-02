PRD: AI‑Assisted Context Aggregation Agent (Option 5)

Overview

Modern knowledge workers spend large amounts of time in distributed conversations and documents.  Capturing the right context before asking a large‑language model (LLM) to draft a reply or generate a summary is tedious.  This project proposes an AI‑assisted context aggregation agent that pulls relevant content from chat (Slack), documents (Google Docs) and web pages, stores it in a semantic index and produces concise summaries via a hosted LLM.  The system leverages Weaviate for vector storage and hybrid search, ACI.dev for secure access to external tools, FriendliAI for inference, and Comet/Opik for observability and evaluation.  It will expose a simple front‑end interface (initially via a Raycast command or browser extension) where users can tag topics, fetch context and receive actionable summaries.

Objectives
	•	Streamline context gathering – Allow users to select or specify a Slack channel, document link or URL and tag it under a topic.  The agent fetches the content, cleans formatting and stores it in a unified schema.
	•	Enable semantic retrieval – Use Weaviate’s vector and hybrid search capabilities to store embeddings of each snippet and perform relevant retrieval ￼ ￼.
	•	Provide on‑demand summarization – Send aggregated context to a summarization model hosted on FriendliAI, leveraging their high‑performance inference platform ￼ ￼.
	•	Ensure secure tool access – Use ACI.dev’s middleware to authenticate and authorize API calls to Slack and Google Docs ￼, ensuring fine‑grained permissions and observability ￼.
	•	Log and evaluate AI outputs – Instrument LLM calls with Comet/Opik to capture traces, measure hallucination and relevance metrics and support iterative improvement ￼ ￼.

Target Users
	•	Team leads and knowledge workers who frequently need to compose impactful messages in Slack, email or documents and want quick access to previous context.
	•	AI enthusiasts and developers seeking a proof‑of‑concept for multi‑tool context aggregation integrated with vector search and LLM summarization.

Key Features

1. Multi‑Source Context Collection
	•	Users initiate a request through a Raycast command or browser extension.  They choose the source type (Slack, Google Doc or Web URL) and optionally a date range.
	•	The system uses ACI.dev connectors to call tool functions: SLACK__GET_MESSAGES for Slack channels, GOOGLE_DOC__GET_DOCUMENT for Docs or a simple fetch for web pages.  ACI.dev enforces authentication and logs requests with fine‑grained permissions ￼.
	•	Each retrieved message, document section or webpage snippet is converted to a standardized ContextItem object with metadata (source type, channel/document ID, timestamp, author, tag).

2. Vector Storage & Retrieval
	•	For each ContextItem, the service computes an embedding using a transformer model.  It then upserts the item into a Weaviate collection with its vector and metadata.
	•	Weaviate’s hybrid search allows combining semantic and keyword search when retrieving context ￼.  Users can later issue queries like “recent discussions about project X” and get the top‑k snippets.

3. Summarization & Response Generation
	•	When the user requests a summary, the agent queries Weaviate for the relevant snippets (based on the topic tag and query) and concatenates them into a prompt.
	•	The prompt is sent to a summarization model deployed on FriendliAI.  FriendliAI offers low‑latency inference and cost‑efficient GPU usage ￼ ￼.  The response is a concise summary tailored to the user’s request.
	•	Summaries are returned to the UI, stored in Weaviate for later reuse, and optionally posted back to Slack.

4. Governance & Security
	•	ACI.dev handles OAuth flows for Slack and Google Workspace and restricts calls to authorized scopes ￼.  It logs each tool invocation, enabling auditing and real‑time blocking if anomalies occur ￼.
	•	Data is encrypted in transit and at rest.  Sensitive information (e.g., Slack tokens) is never stored in the front‑end.

5. Observability & Evaluation
	•	All LLM calls to FriendliAI are instrumented via Comet/Opik.  The @track decorator captures inputs, outputs and metadata ￼.
	•	Opik’s evaluation metrics score outputs for hallucination, relevance and context precision ￼.  These scores can be displayed to the user or used internally to refine prompts.

6. User Interface
	•	Initial UI – A Raycast extension (built with TypeScript 5 and React) provides a command palette to trigger context collection, search and summarization.  UI components use shadcn/ui (v0.3.x) and tailwindcss (v3.3.x) for styling.  Minimal forms allow specifying sources and tags.
	•	Alternative UI – A Chrome extension can be built later using the same React components.  It provides a floating button in Slack for immediate context capture.

Technical Architecture
	1.	Front‑End: Next.js 14 app (React 18, TypeScript 5.2) with tailwindcss 3.3 and shadcn/ui v0.3.x for component styling.  The Raycast command is compiled from the same codebase using the Raycast developer API.
	2.	API Service: Node.js 18 with NestJS or Express.  Exposes endpoints to initiate context collection, query Weaviate, trigger summarization and manage tags.  Handles authentication with ACI.dev and FriendliAI.
	3.	Vector Store: A managed Weaviate instance in Weaviate Cloud or a local Docker container.  Collections store context items with embeddings; metadata fields enable filtering.
	4.	Inference Service: FriendliAI endpoint hosting a summarization model.  API keys stored securely via environment variables.
	5.	Governance Layer: ACI.dev project configured with Slack and Google connectors.  The API service uses ACI keys to call tool functions.
	6.	Observability: Comet/Opik integrated into API service for logging and evaluation.

Data Model
	•	ContextItem
	•	id: string (UUID)
	•	sourceType: ‘slack’ | ‘google_doc’ | ‘web’
	•	sourceId: string (channel ID, document ID or URL)
	•	content: string (raw text)
	•	metadata: object (author, timestamp, title)
	•	tags: string[]
	•	Summary
	•	id: string
	•	topic: string
	•	summaryText: string
	•	relatedContextIds: string[]

Technology Stack
	•	Language & Frameworks: TypeScript 5.2, Next.js 14, Node.js 18, Express or NestJS.  Use pnpm for dependency management.
	•	UI: tailwindcss 3.3 with shadcn/ui 0.3.x for accessible, reusable components.  Raycast API for command integration.
	•	Vector Database: Weaviate serverless cluster, using the text2vec-transformers module for embeddings.  weaviate-ts-client for TypeScript integration.
	•	Tool Governance: ACI.dev SDK (JavaScript) for tool calls and authentication.
	•	Inference: FriendliAI HTTP API.  Models chosen from their supported list; prefer a mid‑sized summarization model such as Mistral‑7B or Llama‑2 13B.
	•	Observability: Comet/Opik Node SDK for logging and evaluation.
	•	Testing: Jest and React Testing Library.  Use Playwright for end‑to‑end tests.

Implementation Plan
	1.	Repo Setup
	•	Initialize a monorepo with pnpm, containing frontend and backend packages.  Configure TypeScript, ESLint and Prettier.
	•	Install Next.js 14 and set up tailwindcss 3.3 and shadcn/ui 0.3.x.
	•	Scaffold the backend with Express or NestJS and configure environment variables for ACI, Weaviate, FriendliAI and Comet.
	2.	Governance & Tool Configuration
	•	Sign up for ACI.dev.  Create a project and add Slack and Google Docs connectors.  Follow their quickstart to set up OAuth flows, link accounts and obtain an API key ￼.
	•	Configure fine‑grained permissions (read‑only for Slack, read for Docs) and set up logging ￼.
	3.	Vector Store Setup
	•	Create a Weaviate cluster in the cloud.  Use the weaviate-ts-client to define a ContextItem collection with fields for id, content, metadata and tags.
	•	Implement a service in the backend to compute embeddings (using a local transformer or Weaviate’s integrated vectorizer) and upsert items.
	4.	Inference Setup
	•	Sign up for FriendliAI and deploy a summarization model.  Configure a serverless endpoint and record the API key ￼ ￼.
	•	Implement a backend service to send concatenated context to the FriendliAI endpoint and parse the summary.
	5.	API Layer
	•	Implement endpoints for POST /collect (trigger context collection), GET /search (query Weaviate), POST /summarize (summarize a topic) and GET /summary/:id (retrieve saved summary).
	•	Each endpoint interacts with ACI (for collection), Weaviate (for storage/search) and FriendliAI (for summarization) as needed.
	6.	Front‑End
	•	Develop a Raycast command with a form for selecting source type, channel/doc link and tag.  Use tailwind and shadcn components for inputs and results display.
	•	Provide a results view that lists retrieved snippets (ranked by relevance) and displays summaries.  Include a “Copy to clipboard” button.
	7.	Observability
	•	Decorate summarization functions with Comet/Opik’s @track to log calls and evaluation metrics ￼ ￼.
	•	Set up a Comet project and ensure that metrics appear in its dashboard.
	8.	Testing & Deployment
	•	Write unit tests for each service.  Use Playwright to test the Raycast command end‑to‑end.
	•	Deploy the backend to Vercel or a container platform with environment secrets.  Use Weaviate’s serverless cluster; store FriendliAI and ACI keys securely.

Acceptance Criteria
	•	User can authenticate via ACI.dev and select Slack channels or document links for context collection.
	•	Retrieved content is stored in Weaviate with vector embeddings and tags; search returns relevant snippets by query.
	•	Summaries generated via FriendliAI accurately reflect the underlying content and are returned within a few seconds.
	•	All tool calls are authorized, logged and governed via ACI.dev with no leaked credentials.
	•	Comet/Opik logs are generated for each summarization call, with evaluation metrics recorded.
	•	The Raycast command UI is responsive, accessible and matches the aesthetic defined by tailwind and shadcn components.

Risks & Mitigations
	•	Time constraints – Integrating four external platforms in 90 minutes is challenging.  Focus on core flows (Slack + Weaviate + FriendliAI) first; ACI and Comet can be stubbed if necessary.
	•	API permissions – Slack and Google Docs may require admin approval.  Start with public channels or sample documents.
	•	Latency – Summarization models may have variable response times.  Choose a smaller model or use FriendliAI’s optimized endpoints to reduce latency ￼.

Success Metrics
	•	Reduction in time spent manually copying and summarizing context.
	•	Number of successful summarization requests per day.
	•	User satisfaction measured via qualitative feedback.
	•	Evaluation metrics (relevance, hallucination) from Comet/Opik trending positive over time.

Out of Scope
	•	Real‑time collaboration features (multi‑user editing).
	•	Full Slack app distribution and workspace approvals.
	•	Advanced analytics or custom model fine‑tuning.