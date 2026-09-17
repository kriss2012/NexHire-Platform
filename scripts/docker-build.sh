#!/usr/bin/env bash
set -euo pipefail

GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
echo "==> Building Docker Images with Git SHA tag: ${GIT_SHA}..."

echo "--> Building Backend Image..."
docker build -t "jobboard-backend:${GIT_SHA}" -t "jobboard-backend:latest" -f backend/Dockerfile backend

echo "--> Building Frontend Image..."
docker build -t "jobboard-frontend:${GIT_SHA}" -t "jobboard-frontend:latest" -f frontend/Dockerfile frontend

echo "==> Docker Images Built Successfully:"
echo "    jobboard-backend:${GIT_SHA}"
echo "    jobboard-frontend:${GIT_SHA}"
