# Production-grade dual-service Dockerfile for Google Cloud Run
FROM python:3.11-slim as base

# Prevent python from writing pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000

WORKDIR /app

# Install system dependencies needed for compiling psycopg2 and general utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port (Cloud Run routes to $PORT which defaults to 3000 here)
EXPOSE 3000

# Create a master startup script to run FastAPI backend and Streamlit frontend together
RUN echo '#!/bin/bash\n\
# Start FastAPI backend in the background on port 8000\n\
echo "Starting FastAPI Backend on port 8000..."\n\
uvicorn app.main_api:app --host 0.0.0.0 --port 8000 &\n\
\n\
# Wait local port check for fastapi\n\
until curl -s http://localhost:8000/api/status > /dev/null; do\n\
  echo "Waiting for FastAPI backend to be ready..."\n\
  sleep 1\n\
done\n\
echo "FastAPI Backend is online!"\n\
\n\
# Start Streamlit frontend on port 3000\n\
echo "Starting Streamlit Frontend on port ${PORT}..."\n\
streamlit run frontend/app.py --server.port=${PORT} --server.address=0.0.0.0\n\
' > /app/run.sh && chmod +x /app/run.sh

# Start services via shell wrapper
CMD ["/app/run.sh"]
