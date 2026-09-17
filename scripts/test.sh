#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Backend Tests..."
cd backend && npm test
cd ..

echo "==> Running Frontend Smoke Tests..."
cd frontend && npm test
cd ..

echo "==> All Tests Passed!"
