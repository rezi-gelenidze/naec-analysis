FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . ./backend

# Expose FastAPI port
EXPOSE 8000

# Start with Gunicorn + UvicornWorker using dynamic worker count (using cpu_count() * 2 + 1 for optimal performance)
# CMD ["sh", "-c", "gunicorn backend.main:app -k uvicorn.workers.UvicornWorker -w $(python -c 'import multiprocessing; print((multiprocessing.cpu_count() * 2) + 1)') -b 0.0.0.0:8000 --timeout 60"]
CMD ["sh", "-c", "gunicorn backend.main:app -k uvicorn.workers.UvicornWorker -w 1 -b 0.0.0.0:8000 --timeout 60 --keep-alive 30
"]
