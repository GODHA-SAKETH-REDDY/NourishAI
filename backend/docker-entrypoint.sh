#!/usr/bin/env bash
set -e

# Entry point: run migrations, collectstatic, then start the CMD
echo "Starting container entrypoint..."

# Ensure env var defaults
DJANGO_DEBUG="${DJANGO_DEBUG:-False}"
DJANGO_ALLOWED_HOSTS="${DJANGO_ALLOWED_HOSTS:-localhost 127.0.0.1}"

export DJANGO_DEBUG
export DJANGO_ALLOWED_HOSTS

# Run migrations (safe to run each start)
if [ -f ./manage.py ]; then
  echo "Running migrations..."
  python manage.py migrate --noinput || true
  echo "Collecting static files..."
  python manage.py collectstatic --noinput || true
fi

exec "$@"
