# Rescomail

Rescomail is an AI job application copilot for resume parsing, ATS analysis,
cold outreach, and application tracking.

## Project Structure

```
apps/
  web/            Next.js app — auth, dashboard, uploads, and product routes (Vercel)
  ai-service/     FastAPI service — PDF extraction, resume parsing, ATS analysis,
                  cold email generation (Render)
packages/
  auth/           Better Auth configuration and client helpers
  db/             Drizzle schema and database client
  env/            Typed environment validation for app/runtime boundaries
  ui/             Shared UI components
  validations/    Shared Zod schemas for forms and service contracts
```

Some feature folders are intentionally reserved for upcoming modules.

---

## Local Development

```sh
pnpm install
```

Copy the root example env and fill in real credentials:

```sh
cp .env.example .env
```

Run everything together with Turbo:

```sh
pnpm dev
```

Or run each app individually:

```sh
# Web app only
pnpm dev --filter=web

# AI service only
cd apps/ai-service
pnpm install-deps
pnpm dev
```

For the local upload -> Trigger.dev -> AI service flow, ensure these are set in `.env`:

```sh
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=<same-long-token-in-web-and-ai-service>
```

---

## Deployment

### Web app → Vercel

Copy `apps/web/.env.web.example` into Vercel → Project → Settings → Environment Variables.
Every variable in that file is required unless marked optional.

### AI service → Render

Copy `apps/ai-service/.env.ai.example` into Render → Environment → Environment Variables.
`GEMINI_API_KEY` and `AI_SERVICE_API_KEY` are required; the service refuses to
start without them.

### Shared secrets

Two secrets must match across both deployments:

| Secret                   | Web app variable     | AI service variable  |
| ------------------------ | -------------------- | -------------------- |
| Inbound auth (web -> AI) | `AI_SERVICE_API_KEY` | `AI_SERVICE_API_KEY` |

Generate each with: `openssl rand -hex 32`

---

## AI Service

### Endpoints

| Method | Path                 | Description                            |
| ------ | -------------------- | -------------------------------------- |
| `GET`  | `/health`            | Health check                           |
| `POST` | `/parse`             | PDF resume extraction and structuring  |
| `POST` | `/ats/analyze`       | ATS scoring against a job description  |
| `POST` | `/coldmail/generate` | Cold email generation from resume + JD |

All endpoints except `/health` require the `AI_SERVICE_API_KEY` bearer token.

### Module layout

```
app/
  api/            FastAPI routing and auth dependencies
  schemas/        Pydantic request/response contracts
  pipelines/      End-to-end workflow orchestrators
  services/
    coldmail_generation.py   Pipeline orchestration (Gemini → validate → fallback)
    coldmail_helpers.py      Deterministic helpers: copy building, scoring, text utils
    coldmail_body.py         Body post-processing: prose blob → email structure
    company_context.py       Tavily web scraping for company context enrichment
    ats/
      intelligence.py        Semantic match + compatibility prediction orchestrator
      gaps.py                Skill-gap detection, severity, and recommendations
      guidance.py            RAG-grounded recruiter guidance from knowledge base
      score_categories.py    Per-category ATS score computation
      job_profile.py         Job profile extraction from job descriptions
      insights.py            ATS insights generation
      suggestion_blocks.py   Rewrite suggestion generation
      helpers.py             Shared ATS utilities
      knowledge_base.py      Internal guidance document store and retrieval
  llm/            Gemini provider client (with automatic fallback to gemini-1.5-flash)
  prompts/        Prompt templates
  models/         Provider-specific schemas and trained model artifacts
  embeddings/     Sentence Transformers embedding and reranker layers
  workers/        Background workers
  utils/          Shared text utilities
```

### Gemini model fallback

If the configured model (`GEMINI_MODEL`, default `gemini-2.5-flash`) returns a `429`
or `503` (high demand / overloaded), the service automatically retries the same
request once with `gemini-1.5-flash`. This is logged as a `WARNING` in Render logs.

### Cold email quality score

Quality score (0–98) is computed server-side from input richness — not by the LLM:

| Input                               | Points |
| ----------------------------------- | ------ |
| Base                                | 62     |
| Job title provided                  | +8     |
| Company name provided               | +8     |
| Recipient name or role              | +4     |
| Company context (scraped or manual) | +6     |
| Personal note                       | +5     |
| Skills found in resume              | +4     |
| Structured (parsed) resume          | +5     |

### Company context (Tavily)

When `companyWebsiteUrl` is provided and `TAVILY_API_KEY` is set, the AI service
scrapes the company website before generating the cold email. The extracted context
is used to personalise the email body. If `TAVILY_API_KEY` is unset, scraping is
silently skipped and the email is generated without it.

### Intelligence pipeline

- **Embedding layer** — `BAAI/bge-base-en-v1.5` (sentence-transformers) for
  resume/job semantic similarity and shared concept extraction.
  Override with `RESCOMAIL_EMBEDDING_MODEL`.
- **Reranker** — `cross-encoder/ms-marco-MiniLM-L12-v2` for deeper pairwise
  resume/job relevance scoring. Override with `RESCOMAIL_RERANKER_MODEL`.
- **Compatibility predictor** — calibrated logistic model loaded from
  `app/models/artifacts/ats_compatibility_v1.json`.
- **Skill-gap analysis** — ranks missing/weak requirements by severity (critical /
  important / optional).
- **RAG guidance** — retrieval-grounded recruiter tips from an internal knowledge base.

`RESCOMAIL_ALLOW_HASHED_EMBEDDING_FALLBACK=1` skips loading sentence-transformers
entirely (hashed text fallback). **Never enable this in production.**

---

## Quality Gates

```sh
pnpm lint
pnpm check-types
pnpm build
```

AI service compile smoke check:

```sh
cd apps/ai-service
pnpm check
```

---

## Database

The Drizzle schema includes Better Auth tables, resume upload and parsing records,
organization and membership tables, and subscription and usage-event foundations
for billing and credits.

Generate migrations before applying schema changes to a shared environment:

```sh
pnpm --filter @repo/db db:generate
```

---

## Security Notes

- **Never commit `.env` files.** Use the `.example` files as templates only.
- Rotate any credential that was ever placed in a local example file.
- `AI_SERVICE_API_KEY` must be a long random secret (>= 32 chars) and must match
  across both deployments.
- Configure `RESUME_FILE_ALLOWED_HOSTS` in production to restrict the AI service
  from downloading files from arbitrary hosts (SSRF protection).
- Replace placeholder privacy/terms pages with reviewed legal copy before public launch.
