#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
docker compose up --build -d
echo "Kanban running at http://localhost:8080"
