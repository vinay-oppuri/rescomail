from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health():
    redis_status = "unavailable"
    try:
        from app.embeddings.cache import _get_client
        client = _get_client()
        if client is not None:
            # Actively ping Redis to check if it's currently reachable
            client.ping()
            redis_status = "connected"
    except Exception:
        redis_status = "error"

    return {
        "status": "ok",
        "redis": redis_status
    }

