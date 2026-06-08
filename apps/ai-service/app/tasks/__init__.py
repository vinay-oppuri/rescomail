"""
app/tasks/__init__.py — Celery application factory.

Usage:
    # Start a worker:
    celery -A app.tasks worker --loglevel=info

    # Start beat scheduler (for periodic job digest):
    celery -A app.tasks beat --loglevel=info

    # Combined (dev only):
    celery -A app.tasks worker --beat --loglevel=info
"""

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "rescomail-ai",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=[
        "app.tasks.ats_tasks",
        "app.tasks.coldmail_tasks",
        "app.tasks.job_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    # Retry failed tasks after 60 s, max 3 times
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,  # one task at a time per worker — avoid memory spikes
)
