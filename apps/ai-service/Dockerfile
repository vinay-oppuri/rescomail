# =============================================================================
# Rescomail AI Service — Dockerfile
# Stateless FastAPI server — no Celery, no Redis, no local ML models.
# Embeddings are handled via the Gemini API at runtime.
# =============================================================================

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

RUN adduser --system --no-create-home --group appuser \
    && chown -R appuser:appuser /app

COPY app ./app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]