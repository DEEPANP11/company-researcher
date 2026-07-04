# Company Research Assistant

AI-powered company research tool. Enter a company name or website URL to get an automated research report with competitor analysis and a downloadable PDF.

## Features

- **Company Research** — Enter company name or URL; automatically finds the official website
- **Website Crawling** — Smart crawler with priority queue, sitemap support, robots.txt compliance; Cheerio + Playwright fallback
- **Search Integration** — Multi-query Serper.dev searches for comprehensive data collection
- **AI Analysis** — OpenRouter integration with model selection (GPT, Claude, Gemini, etc.)
- **Competitor Analysis** — AI suggests competitors + Serper verification
- **PDF Generation** — Professional client-side PDF reports via @react-pdf/renderer
- **Discord Integration** — Send reports to Discord channels with PDF attachment
- **SSE Streaming** — Real-time progress updates in the chat interface

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 + CSS variables |
| Crawling | Cheerio (primary) + Playwright (fallback) |
| Search | Serper.dev API |
| AI | OpenRouter API |
| Validation | Zod |
| State | Zustand |
| PDF | @react-pdf/renderer (client-side) / Puppeteer (server-side) |
| Icons | Lucide React |

## Setup

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd company-researcher
npm install
```

### Environment Variables

Create `.env.local` in the project root:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key for AI analysis |
| `SERPER_API_KEY` | Yes | — | Serper.dev API key for web search |
| `MAX_PAGES` | No | `15` | Max pages to crawl |
| `MAX_DEPTH` | No | `2` | Max crawl depth |
| `MAX_CHARS` | No | `250000` | Max characters to extract |
| `CRAWL_TIMEOUT_MS` | No | `45000` | Crawl timeout in milliseconds |
| `LOG_LEVEL` | No | `info` | Pino log level |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Architecture

```
User Input (name/URL)
    │
    ▼
ResearchService (SSE streaming)
    │
    ├─ WebsiteFinder (Serper → find official site)
    ├─ CrawlerManager
    │   ├─ Check robots.txt
    │   ├─ Check sitemap.xml
    │   ├─ Priority queue crawl (Playwright → Cheerio)
    │   └─ Content cleaning
    ├─ SerperClient (multi-query search)
    ├─ OpenRouterClient (AI analysis with JSON output)
    ├─ CompetitorVerifier (AI suggest → Serper verify)
    └─ PDF generation
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main chat interface
│   ├── settings/page.tsx     # Discord config page
│   └── api/
│       ├── research/route.ts # SSE streaming endpoint
│       ├── models/route.ts   # Available AI models
│       └── discord/route.ts  # Discord webhook
├── components/
│   ├── chat/                 # ChatMessage, ProgressSteps, ModelSelector
│   ├── research/             # ResearchResult, PdfDownloadButton, ClientPdf
│   └── ui/                   # Shared UI primitives
├── services/
│   ├── research/             # Orchestrator + WebsiteFinder + CompetitorVerifier
│   ├── crawler/              # CrawlerManager, UrlNormalizer, RobotsParser, etc.
│   ├── ai/                   # OpenRouterClient, PromptBuilder, JsonExtractor
│   ├── search/               # SerperClient
│   ├── pdf/                  # PdfGenerator
│   └── discord/              # DiscordWebhook
├── hooks/
│   ├── useResearch.ts        # SSE research hook
│   └── useStore.ts           # Zustand store
├── lib/
│   ├── cache.ts              # LRU cache
│   ├── logger.ts             # Pino logger
│   ├── utils.ts              # Shared utilities
│   └── validation.ts         # Zod schemas
└── types/                    # TypeScript types
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set the environment variables in your Vercel project dashboard.

## API Endpoints

### `POST /api/research`
Start a research job. Returns SSE stream.

```json
{ "query": "Tesla", "model": "openai/gpt-4o" }
```

### `GET /api/models`
Returns available AI models.

### `POST /api/discord`
Send report to Discord channel.

```json
{
  "botToken": "...",
  "channelId": "...",
  "applicantName": "John",
  "applicantEmail": "john@email.com",
  "companyName": "Tesla",
  "companyWebsite": "https://tesla.com",
  "pdfBase64": "..."
}
```
