# RescoMail AI Service — Agent Context

## ✅ Current Architecture (what's actually implemented)

This is a stateless, lightweight FastAPI server running on Python 3.12. It does not persist state or manage asynchronous background tasks via Celery/Redis; all long-running task orchestration is managed externally by Trigger.dev.

### Key Components:
- **FastAPI Routing (`app/api/routes/`):**
  - `/health/live` and `/health/ready`: Liveness and readiness endpoints.
  - `/parse`: PDF resume parsing. Wraps synchronous fitz extraction inside a named `thread_executor`.
  - `/ats/analyze`: Computes ATS compatibility score and skill gaps.
  - `/coldmail/generate`: Generates customized recruiter cold outreach emails.
- **LLM Integrations (`app/llm/`):**
  - Integrates with the Gemini Developer API.
  - Uses `gemini-3.5-flash` by default.
  - Degrades gracefully with tenant retry to `gemini-1.5-flash` if rate limited or overloaded.
- **Embeddings Layer (`app/embeddings/`):**
  - Uses the Gemini API to support semantic resume analysis.
- **Shared Bounded Thread Pool Executor (`app/core/executor.py`):**
  - Configures a bounded thread pool to execute blocking LLM requests and PyMuPDF parsing off the main event loop thread.

---

## 🗺️ Roadmap (what's planned but NOT yet built)

The following components are part of the roadmap and **MUST NOT** be assumed as currently existing or imported:
- **`app/tasks/` & Celery Background Workers:** Real-time long-running tasks are currently managed via Trigger.dev in the web package. Do not import `celery` or assume background queue processing is local.
- **`Dockerfile.worker`:** No dedicated Docker background worker setup exists.
- **Redis Cache Layer:** Do not attempt to hook up a Redis cache for embedding storage. The server remains completely stateless.
