#!/usr/bin/env bash
set -euo pipefail

echo "==> Building Backend..."
cd backend && npm run build
cd ..

echo "==> Building Frontend..."
cd frontend && npm run build
cd ..

echo "==> Production Builds Completed!"
