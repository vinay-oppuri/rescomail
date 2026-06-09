# Rescomail AI Service - Agents & Architecture

This document outlines the architecture, features, technologies, and **production recommendations** for the `ai-service` of Rescomail.

---

## 🚀 Overview

The `ai-service` is a high-performance REST API built to handle complex AI workloads. It leverages Google's Gemini models to perform structured data extraction, semantic analysis, and natural language generation.

The core responsibilities of this service are divided into three main pipelines:
1. **Resume Parsing**: Extracting and structuring data from raw documents.
2. **ATS Analysis**: Scoring and evaluating resumes against specific job descriptions.
3. **Cold Mail Generation**: Drafting highly contextual outreach emails.

---

## 🛠️ Technology Stack

| Technology | Purpose | Feature / Usage |
| :--- | :--- | :--- |
| **FastAPI** | Web Framework | Core framework for all REST API endpoints. Chosen for its async support and performance. |
| **Uvicorn** | ASGI Server | Serves the FastAPI application (`uvicorn app.main:app`). |
| **Python 3.12+** | Runtime | The primary programming language. Managed via `uv`. |
| **Google Gemini API** | Large Language Model | Powers intelligent extraction, ATS evaluation logic, and email drafting. Default: `gemini-2.5-flash`. |
| **Pydantic (v2)** | Data Validation | Defines schemas (`app/schemas`, `app/models`) to ensure strict inputs/outputs and structured JSON responses from Gemini. |
| **PyMuPDF** | Document Processing | Extracts text and layout information from PDF resumes (`app/services/document_extraction.py`). |
| **Sentence-Transformers** | Embeddings | Powers semantic similarity and reranking (`app/embeddings/semantic.py`, `app/embeddings/reranker.py`). |
| **uv** | Package Manager | Fast Python package and environment manager. |

---

## 🧩 Core Features & Pipelines

### 1. Resume Parser Pipeline (`app/pipelines/resume_parser.py`)
- **Text Extraction**: Uses `PyMuPDF` to reliably parse text and maintain reading order.
- **Cleaning & Heuristics**: Initial processing via `app/services/text_cleaning.py` and `app/services/resume_heuristics.py`.
- **LLM Structuring**: Extracted text sent to Gemini with strict Pydantic schemas to produce validated structured fields.

### 2. ATS Analysis Pipeline (`app/pipelines/ats_analysis.py`)
- **Embeddings & Search**: Lexical + semantic embeddings to map resume skills to job requirements.
- **Scoring Engine**: Multi-category evaluation via `app/services/ats/scores.py`.
- **Intelligence Generation**: Gaps, evidence, and recommendations surfaced from the match.

### 3. Cold Mail Generation Pipeline (`app/pipelines/coldmail_generation.py`)
- **Context Building**: Company context extracted and aligned with resume data.
- **Prompt Engineering**: Version-controlled templates in `app/prompts/coldmail.py`.
- **Drafting Engine**: Gemini generates the email body with professional tone.

---

## 📂 Recommended Production Folder Structure

The structure below keeps the existing architecture intact and layers in missing production concerns: a `core/` infrastructure module, proper `tasks/` for async workers, a `jobs/` service module, and a `tests/` suite.

```text
ai-service/
├── app/
│   ├── main.py                         # FastAPI app factory — register middleware here
│   ├── __init__.py
│   │
│   ├── api/
│   │   ├── dependencies.py
│   │   ├── router.py
│   │   └── routes/
│   │       ├── ats.py
│   │       ├── coldmail.py
│   │       ├── health.py
│   │       ├── resume_parser.py
│   │       └── jobs.py                 # NEW — /jobs/subscribe, /jobs/digest, /jobs/unsubscribe
│   │
│   ├── core/                           # NEW — app-wide infrastructure concerns
│   │   ├── config.py                   # pydantic-settings: typed env vars, validated at startup
│   │   ├── logging.py                  # structlog setup with trace_id middleware
│   │   ├── exceptions.py               # custom exception classes + FastAPI exception handlers
│   │   └── rate_limit.py               # slowapi limiter configuration
│   │
│   ├── embeddings/
│   │   ├── lexical.py
│   │   ├── reranker.py
│   │   ├── semantic.py
│   │   └── cache.py                    # NEW — Redis-backed embedding cache (SHA256 key per text)
│   │
│   ├── llm/
│   │   ├── gemini.py                   # MODIFY — add tenacity retry + token usage logging
│   │   └── base.py                     # NEW — abstract LLMProvider interface for future providers
│   │
│   ├── models/
│   │   ├── ats.py
│   │   ├── ats_display.py
│   │   ├── ats_keywords.py
│   │   ├── ats_scoring.py
│   │   ├── ats_semantics.py
│   │   ├── ats_stop_words.py
│   │   ├── coldmail.py
│   │   ├── resume.py
│   │   └── artifacts/
│   │       └── ats_compatibility_v1.json
│   │
│   ├── pipelines/
│   │   ├── ats_analysis.py
│   │   ├── coldmail_generation.py
│   │   ├── resume_parser.py
│   │   └── job_search.py               # NEW — orchestrates job search → filter → digest → deliver
│   │
│   ├── prompts/
│   │   ├── coldmail.py
│   │   ├── resume_parser.py
│   │   └── jobs.py                     # NEW — job digest and relevance summary prompts
│   │
│   ├── schemas/
│   │   ├── ats.py
│   │   ├── coldmail.py
│   │   └── resume.py
│   │
│   ├── services/
│   │   ├── ats_scoring.py
│   │   ├── coldmail_body.py
│   │   ├── coldmail_generation.py
│   │   ├── coldmail_helpers.py
│   │   ├── company_context.py
│   │   ├── document_extraction.py      # MODIFY — wrap PyMuPDF in ThreadPoolExecutor
│   │   ├── resume_heuristics.py
│   │   ├── resume_structuring.py
│   │   ├── resume_text.py
│   │   ├── text_cleaning.py
│   │   ├── ats/
│   │   │   ├── constants.py
│   │   │   ├── evidence.py
│   │   │   ├── gaps.py
│   │   │   ├── guidance.py
│   │   │   ├── helpers.py
│   │   │   ├── insights.py
│   │   │   ├── intelligence.py
│   │   │   ├── job_profile.py
│   │   │   ├── knowledge_base.py
│   │   │   ├── recommendations.py
│   │   │   ├── scores.py
│   │   │   ├── score_categories.py
│   │   │   └── suggestion_blocks.py
│   │   └── jobs/                       # NEW — jobs feature services
│   │       ├── search.py               # JSearch / Adzuna API client with pagination
│   │       ├── relevance.py            # cosine sim filter — reuses app/embeddings/
│   │       ├── digest.py               # Gemini: explain why each job fits the user's profile
│   │       └── delivery.py             # email delivery via Resend / Postmark
│   │
│   ├── tasks/                          # NEW — replaces empty workers/
│   │   ├── __init__.py                 # Celery app factory
│   │   ├── ats_tasks.py                # async ATS analysis task
│   │   ├── coldmail_tasks.py           # async cold mail task
│   │   └── job_tasks.py               # Celery beat: fetch → filter → digest → send on schedule
│   │
│   └── utils/
│       ├── text.py
│       └── hashing.py                  # NEW — SHA256 helpers for cache keys
│
├── tests/                              # NEW — currently missing entirely
│   ├── unit/                           # unit tests per service module
│   ├── integration/                    # pipeline-level integration tests
│   └── evals/                          # prompt regression suite — run before any prompt change
│
├── docker/                             # NEW — split by service
│   ├── Dockerfile.api                  # API image (uses start.sh to run all services)
│   ├── Dockerfile.worker               # Celery worker image
│   └── start.sh                        # NEW — Unified start script for free tier (runs API + Worker + Beat)
│
├── docker-compose.yml                  # NEW — local dev: api + worker + redis
├── pyproject.toml                      # NEW — replaces requirements.txt
├── .dockerignore
├── .env.example                        # MODIFY — document every variable
├── package.json

└── AGENTS.md
```

---

## ⚠️ On LangChain — Don't Use It

**Verdict: LangChain is not recommended for this service.**

Your current direct-Gemini + Pydantic pattern is the better production choice. LangChain adds:

- Massive abstraction overhead — hidden prompt templates, opaque chain execution, hard to debug in prod
- Heavy dependency footprint that conflicts with `uv`'s lean environment philosophy
- Known version instability — breaking changes across minor versions have killed production apps
- No real benefit here: you're calling Gemini directly with Pydantic schemas for structured extraction, which is exactly what LangChain abstracts — your version is simpler and more debuggable

LangChain adds value for multi-agent tool-calling loops. None of your three pipelines require that. If you need it later for the Jobs feature, prefer **LangGraph** — better observability, more stable API.

---

## 🔧 Production Gaps & Fixes

### Critical

**1. No retry logic on Gemini calls**
Gemini 2.5-flash has rate-limit spikes. A single `429` surfaces as a `500` to the user.
```python
# app/llm/gemini.py
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception)
)
async def call_gemini(...):
    ...
```

**2. Sync PyMuPDF blocks the event loop**
PyMuPDF is synchronous. Running it directly in an async FastAPI handler blocks the entire event loop during heavy PDF parsing.
```python
# app/services/document_extraction.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor()

async def extract_text(file_bytes: bytes) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, _sync_extract, file_bytes)
```

**3. No async task queue**
ATS analysis is a blocking HTTP call. One slow Gemini response stalls the entire worker. Move heavy pipelines to Celery tasks and return a `task_id` immediately.

### High Priority

**4. No structured logging**
Without a `trace_id` per request, debugging cross-pipeline failures is guesswork.
```python
# app/core/logging.py — structlog with trace_id
import structlog
import uuid
from starlette.middleware.base import BaseHTTPMiddleware

class TraceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        trace_id = str(uuid.uuid4())
        structlog.contextvars.bind_contextvars(trace_id=trace_id)
        response = await call_next(request)
        response.headers["X-Trace-Id"] = trace_id
        return response
```

**5. No rate limiting**
A single client can exhaust your Gemini quota. Add `slowapi`:
```python
# app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/ats/analyze")
@limiter.limit("10/minute")
async def analyze(request: Request, ...):
    ...
```

**6. No typed config**
Replace raw `os.environ` calls with a `pydantic-settings` model validated at startup — fail fast on missing vars.
```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    ai_service_api_key: str
    redis_url: str = "redis://localhost:6379/0"
    rate_limit_per_minute: int = 60
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
```

### Medium Priority

**7. No embedding cache**
The same JD gets embedded on every request. Cache by SHA256 of the input text.
```python
# app/embeddings/cache.py
import hashlib, redis, numpy as np

redis_client = redis.Redis.from_url(settings.redis_url)

def get_cached_embedding(text: str) -> np.ndarray | None:
    key = f"emb:{hashlib.sha256(text.encode()).hexdigest()}"
    cached = redis_client.get(key)
    return np.frombuffer(cached, dtype=np.float32) if cached else None

def set_cached_embedding(text: str, vector: np.ndarray, ttl: int = 86400):
    key = f"emb:{hashlib.sha256(text.encode()).hexdigest()}"
    redis_client.setex(key, ttl, vector.tobytes())
```

**8. No prompt regression tests**
Prompt changes can silently break structured outputs. Before merging any prompt edit, run an eval suite against a fixed set of inputs and assert on output schema validity and key field presence.

---

## 📦 Tech Stack Additions

| Add | Priority | Reason |
| :--- | :--- | :--- |
| `tenacity` | Critical | Retry with backoff on all Gemini API calls |
| `celery[redis]` | Critical | Async task queue — ATS and cold mail must not be blocking HTTP calls |
| `redis` | Critical | Celery broker + embedding cache |
| `structlog` | High | Structured logging with `trace_id` per request |
| `slowapi` | High | Per-client rate limiting on FastAPI endpoints |
| `pydantic-settings` | High | Typed, validated config from env vars |
| `pytest-asyncio` | Medium | Async-aware test runner for FastAPI + Celery tasks |
| `resend` or `postmark` | Medium | Email delivery for Jobs digest (better deliverability than SendGrid for automated mail) |
| `pyproject.toml` | Low | Replace `requirements.txt` — proper dependency groups (dev, test, prod) |

**Do not change:** FastAPI, Pydantic v2, PyMuPDF, uv, Gemini 2.5-flash, sentence-transformers. These are all correct choices.

---

## 🏗️ Jobs Feature — Integration Plan

The Jobs feature searches for relevant listings based on the user's resume and preferences, then emails a personalized digest on a schedule.

### Pipeline Flow

```
User input: role + location + experience level + frequency preference
      │
      ▼
[1] Job Search      → query JSearch (RapidAPI) or Adzuna API
      │
      ▼
[2] Relevance Filter → embed JD + resume → cosine similarity → top-N
                       (reuses app/embeddings/semantic.py)
      │
      ▼
[3] Reranking        → cross-encoder final ordering
                       (reuses app/embeddings/reranker.py)
      │
      ▼
[4] Digest Generation → Gemini explains why each job fits the user
                        (prompt in app/prompts/jobs.py)
      │
      ▼
[5] Email Delivery   → Celery beat: daily or weekly on user preference
                       (Resend / Postmark via app/services/jobs/delivery.py)
```

### Job Source Recommendation

| Source | Free Tier | Notes |
| :--- | :--- | :--- |
| **JSearch (RapidAPI)** | 500 req/mo | Best to start. Wide coverage, structured JSON, global listings. |
| **Adzuna** | Free tier | Good for UK/EU/AU markets. Requires API key registration. |
| ~~LinkedIn~~ | None | Scraping violates ToS. Official API requires partner approval — not realistic. |

### Key Design Decisions

- **Celery beat for scheduling** — do not make job search a real-time blocking endpoint
- **Cache listings by `(role + location + date)`** in Redis — avoid re-fetching identical results
- **User preferences stored in main app DB** — `ai-service` stays stateless
- **MX validation before sending** — check deliverability before dispatching digest
- **Reuse existing embeddings infra** — `reranker.py` directly powers job relevance scoring

### New Files Required

```text
app/api/routes/jobs.py
app/pipelines/job_search.py
app/prompts/jobs.py
app/services/jobs/search.py
app/services/jobs/relevance.py
app/services/jobs/digest.py
app/services/jobs/delivery.py
app/tasks/job_tasks.py
```

---

## ☁️ Render Free Tier Unified Deployment

To bypass Render's $7/month charge for running separate Background Workers, we package the API, Celery Worker, and Celery Beat scheduler together inside a single Web Service container using a startup script:

1. **`docker/start.sh`** starts the Celery Beat scheduler, the Celery Worker (with `--concurrency=1` to optimize RAM), and the FastAPI Uvicorn web server concurrently.
2. **`docker/Dockerfile.api`** is configured to execute `./start.sh` on startup.
3. **Important Configuration:** Because Render's Free tier provides only 512MB of RAM, you **must** set:
   * `RESCOMAIL_ALLOW_HASHED_EMBEDDING_FALLBACK=True`
   This keeps the combined memory footprint of the container under **150MB**.

---

## 🔑 Required Environment Variables


| Variable | Required For | Notes |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | All pipelines | Existing |
| `AI_SERVICE_API_KEY` | Auth middleware | Existing |
| `REDIS_URL` | Celery + cache | New. Format: `redis://localhost:6379/0` |
| `JSEARCH_API_KEY` | Jobs feature | New. RapidAPI key |
| `ADZUNA_APP_ID` | Jobs feature | New. Optional alternative to JSearch |
| `RESEND_API_KEY` | Jobs digest | New. Email delivery |
| `LOG_LEVEL` | Logging | New. Default: `INFO` |
| `RATE_LIMIT_PER_MINUTE` | Rate limiting | New. Default: `60` |

---

## ✅ Implementation Priority

| # | Task | Effort |
| :--- | :--- | :--- |
| 1 | Add `tenacity` retry to `app/llm/gemini.py` | 2h |
| 2 | Wrap PyMuPDF in `ThreadPoolExecutor` in `document_extraction.py` | 1h |
| 3 | Create `app/core/` with `config.py` + `logging.py` | 3h |
| 4 | Add `slowapi` rate limiting middleware in `main.py` | 1h |
| 5 | Set up Celery + Redis: `app/tasks/` + `Dockerfile.worker` | 1d |
| 6 | Add Redis embedding cache in `app/embeddings/cache.py` | 4h |
| 7 | Write prompt regression tests in `tests/evals/` | 1d |
| 8 | Build `app/services/jobs/` + `app/pipelines/job_search.py` | 3d |
| 9 | Celery beat schedule for jobs digest email delivery | 1d |
| 10 | Replace `requirements.txt` with `pyproject.toml` | 1h |

---

## 🔒 Security & Authentication

The service requires specific environment variables to function:
- `GEMINI_API_KEY`: Required for LLM access.
- `AI_SERVICE_API_KEY`: Used to authenticate inbound requests from the main web application.