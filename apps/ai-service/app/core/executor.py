from concurrent.futures import ThreadPoolExecutor

# Shared, named ThreadPoolExecutor for off-loop blocking operations
# (CPU-bound PyMuPDF PDF parsing and external HTTP calls)
thread_executor = ThreadPoolExecutor(
    max_workers=10,
    thread_name_prefix="ai-service-exec",
)
