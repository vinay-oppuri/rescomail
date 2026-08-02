import asyncio
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import TypeVar

# Shared, named ThreadPoolExecutor for off-loop blocking operations
# (CPU-bound PyMuPDF PDF parsing and external HTTP calls)
thread_executor = ThreadPoolExecutor(
    max_workers=10,
    thread_name_prefix="ai-service-exec",
)

Result = TypeVar("Result")


async def run_in_thread(function: Callable[..., Result], *args: object) -> Result:
    """Run blocking work without blocking FastAPI's event loop."""
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(thread_executor, function, *args)
