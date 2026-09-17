#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-http://localhost:3001}"

echo "==> Probing Health Endpoints on: ${TARGET_URL}"

echo "--> Testing Liveness (/live)..."
curl -sSf "${TARGET_URL}/live" | grep -q '"alive":true'
echo "    [PASS] Liveness probe OK"

echo "--> Testing Readiness (/ready)..."
curl -sSf "${TARGET_URL}/ready" | grep -q '"ready":true'
echo "    [PASS] Readiness probe OK"

echo "--> Testing Health Report (/health)..."
curl -sSf "${TARGET_URL}/health" > /dev/null
echo "    [PASS] Health report OK"

echo "--> Testing Metrics (/metrics)..."
curl -sSf "${TARGET_URL}/metrics" | grep -q 'http_requests_total'
echo "    [PASS] Prometheus metrics OK"

echo "==> All Service Probes Healthy!"
