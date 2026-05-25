FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV RESCOMAIL_EMBEDDING_MODEL=BAAI/bge-base-en-v1.5
ENV RESCOMAIL_RERANKER_MODEL=cross-encoder/ms-marco-MiniLM-L12-v2

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN python -c "import os; from sentence_transformers import CrossEncoder, SentenceTransformer; SentenceTransformer(os.environ['RESCOMAIL_EMBEDDING_MODEL']); CrossEncoder(os.environ['RESCOMAIL_RERANKER_MODEL'])"

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
