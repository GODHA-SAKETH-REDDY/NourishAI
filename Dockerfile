# Multi-stage Dockerfile to build React frontend and run Django backend with Gunicorn

# 1) Build React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install
COPY frontend/ ./
RUN npm run build

# 2) Build Python runtime image
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# system deps for some Python packages and for building requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Copy and install Python deps
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY backend/ ./backend/
# Copy Django project root files if any
COPY manage.py ./

# Copy built frontend into backend's expected build folder
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Copy entrypoint script
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV DJANGO_SETTINGS_MODULE=nutritionist_backend.settings
ENV DJANGO_DEBUG=False

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["gunicorn", "nutritionist_backend.wsgi", "--bind", "0.0.0.0:8000"]
