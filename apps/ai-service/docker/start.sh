#!/bin/bash

# =============================================================================
# Rescomail AI Service - Unified Start Script
# Runs API, Celery Worker, and Celery Beat in a single container for Free Tiers.
# =============================================================================

echo "Starting Celery Beat scheduler..."
celery -A app.tasks beat --loglevel=info &

echo "Starting Celery Worker (concurrency=1)..."
celery -A app.tasks worker --loglevel=info --concurrency=1 &

echo "Starting Uvicorn API..."
# Use exec so that Uvicorn receives OS signals (SIGTERM/SIGINT) directly
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
