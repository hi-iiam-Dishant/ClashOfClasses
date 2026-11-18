#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DB_NAME="${SOURCE_DB_NAME:-clash_of_classes}"
DB_USER="${SOURCE_DB_USER:-root}"
OUT="database/init/001-existing-database.sql"

if ! command -v mariadb-dump >/dev/null 2>&1; then
  echo "mariadb-dump was not found. Install the MariaDB client tools first." >&2
  exit 1
fi
if [[ -e "$OUT" ]]; then
  echo "$OUT already exists; move it aside before exporting again." >&2
  exit 1
fi

args=("--user=$DB_USER" "--databases" "$DB_NAME" "--routines" "--triggers" "--events" "--single-transaction" "--hex-blob" "--default-character-set=utf8mb4")
[[ -n "${SOURCE_DB_HOST:-}" ]] && args+=("--host=$SOURCE_DB_HOST")
[[ -n "${SOURCE_DB_PORT:-}" ]] && args+=("--port=$SOURCE_DB_PORT")
[[ -n "${SOURCE_DB_SOCKET:-}" ]] && args+=("--socket=$SOURCE_DB_SOCKET")

mkdir -p database/init
echo "Exporting database '$DB_NAME' (schema, data, routines, triggers and events) to $OUT"
if [[ "${SOURCE_DB_USE_SUDO:-0}" == "1" ]]; then
  sudo mariadb-dump "${args[@]}" > "$OUT"
else
  mariadb-dump --password "${args[@]}" > "$OUT"
fi

if [[ ! -s "$OUT" ]]; then
  rm -f "$OUT"
  echo "The dump file is empty; export failed." >&2
  exit 1
fi

if ! grep -qi 'check_collision' "$OUT"; then
  echo "WARNING: 'check_collision' was not found in the dump. Verify that the collision stored procedure exists and was exported." >&2
fi

echo "Export complete. Review the dump, then run: docker compose up -d --build"
echo "Keep this SQL dump private: it may contain your database records."
