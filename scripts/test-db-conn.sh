#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed or not on PATH" >&2
  exit 1
fi

echo "Testing database connection..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "select 1;"

echo "Connection OK"
