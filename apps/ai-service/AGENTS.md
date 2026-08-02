# RescoMail AI Service

This app is a stateless FastAPI service. Trigger.dev owns background jobs; do not add
Celery, Redis, or local task queues.

## Structure

- `app/api/`: HTTP routes and authentication only.
- `app/core/`: configuration, logging, rate limiting, and execution helpers.
- `app/schemas/`: public request and response contracts shared with the web app.
- `app/services/resume/`: PDF extraction and resume parsing workflow.
- `app/services/ats/`: ATS prompt, provider fallback, parsing, and workflow.
- `app/services/coldmail/`: company research and cold-email generation workflow.
- `app/llm/`: small external-provider clients.
- `app/embeddings/`: semantic scoring and shared concept aliases.
- `tests/unit/`: isolated behavior tests with external APIs mocked.

Keep routes thin. Put orchestration in each feature's `workflow.py`, pure calculations in
small helpers, and external HTTP calls behind named functions. Preserve `/parse`,
`/ats/analyze`, and `/coldmail/generate` because the web app depends on these paths.

Run `npm run check` after changes.
