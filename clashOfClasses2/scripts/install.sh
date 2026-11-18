#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Engine and the Compose plugin first." >&2
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is required (docker compose)." >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example. Edit DB_PASSWORD and DB_ROOT_PASSWORD, then run this installer again."
  exit 0
fi

if grep -Eq 'replace-with-a-' .env; then
  echo "Please replace the example database passwords in .env before installing." >&2
  exit 1
fi

if [ ! -s database/init/001-existing-database.sql ]; then
  echo "The existing database dump is missing. Export it first with ./scripts/export-existing-db.sh." >&2
  exit 1
fi

echo "Building and starting Clash of Classes..."
docker compose up -d --build

echo ""
echo "Application containers started. Open: http://localhost:${APP_PORT:-8080}"
echo "Existing database initialization is supplied from database/init/001-existing-database.sql."
