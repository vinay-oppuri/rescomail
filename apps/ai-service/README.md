# RescoMail AI Service

A small, stateless FastAPI service for resume parsing, ATS analysis, and cold-email
generation.

## How a request flows

```text
HTTP route -> feature workflow -> domain helpers -> Gemini/Groq/Tavily
```

Routes handle HTTP concerns only. A feature's `workflow.py` shows its full business flow,
so that is the best place to start reading:

- `app/services/resume/workflow.py`
- `app/services/ats/workflow.py`
- `app/services/coldmail/workflow.py`

Shared API request and response models live in `app/schemas`. Infrastructure that is not
specific to a feature lives in `app/core`. The service stores no data and runs blocking PDF
or external-API work in a fixed-size thread pool.

## Local setup

1. Copy `.env.ai.example` to `.env`.
2. Set `AI_SERVICE_API_KEY` to a random value of at least 32 characters.
3. Set `GEMINI_API_KEY`. Add `GROQ_API_KEY` and `TAVILY_API_KEY` only for their optional
   fallback and company-context features.
4. Run `npm run dev`.

## Checks

Run `npm run check` to execute Ruff and pytest. External API calls must be mocked in unit
tests so the test suite remains fast and deterministic.
