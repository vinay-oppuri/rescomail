# Rescomail

Rescomail is an AI job application copilot for resume parsing, ATS analysis,
cold outreach, and application tracking.

## Project Structure

- `apps/web` - Next.js app with auth, dashboard, uploads, and product routes.
- `apps/ai-service` - FastAPI service for PDF extraction, AI resume parsing,
  and ATS analysis.
- `packages/auth` - Better Auth configuration and client helpers.
- `packages/db` - Drizzle schema and database client.
- `packages/env` - Typed environment validation for app/runtime boundaries.
- `packages/ui` - Shared UI components.
- `packages/validations` - Shared Zod schemas for forms and service contracts.

Some feature folders are intentionally reserved for upcoming modules.

## Setup

```sh
pnpm install
cp .env.example .env
```

Update `.env` with real credentials. Do not put real secrets in
`.env.example`.

Run the web app:

```sh
pnpm dev --filter=web
```

Run the AI service:

```sh
cd apps/ai-service
pnpm install-deps
pnpm dev
```

For local upload-to-parser flow, set:

```sh
RESUME_PARSER_WEBHOOK_URL=http://localhost:3000/api/parse
AI_SERVICE_URL=http://localhost:8000
RESUME_PARSER_API_KEY=<same-long-token-in-web-and-ai-service>
```

The AI service exposes:

- `GET /health` for health checks.
- `POST /parse` for PDF resume extraction and structuring.
- `POST /ats/analyze` for ATS scoring against a job description. Provide one
  resume source: `resumeText`, `structuredResume`, or `fileUrl`.

The ATS workflow persists every analysis in `ats_analyses`, records credit
usage in `usage_events`, and returns a scored package with extracted job
requirements, exact/semantic keyword evidence, risk analysis, and rewrite
suggestions.

AI service code follows one layered structure:

- `api` owns FastAPI routing and auth dependencies.
- `schemas` owns Pydantic request and response contracts.
- `pipelines` orchestrates end-to-end workflows.
- `services` owns deterministic business logic and document processing.
- `llm`, `prompts`, and `models` own provider clients, prompt templates, and
  provider-specific schema/constants.
- `embeddings`, `workers`, and `utils` hold shared support code.

## Quality Gates

```sh
pnpm lint
pnpm check-types
pnpm build
```

The AI service also has a compile smoke check:

```sh
cd apps/ai-service
pnpm check
```

## Database

The Drizzle schema includes:

- Better Auth tables.
- Resume upload and parsing records.
- Organization and membership tables.
- Subscription and usage-event foundations for billing/credits.

Generate migrations before applying schema changes to a shared environment:

```sh
pnpm --filter @repo/db db:generate
```

## Security Notes

- Rotate any credential that was ever placed in a local example file.
- Keep `.env` files local and uncommitted.
- Use `RESUME_PARSER_API_KEY` for all parser callbacks.
- Configure `RESUME_FILE_ALLOWED_HOSTS` in production for the AI service.
- Replace placeholder privacy/terms pages with reviewed legal copy before
  public launch.
