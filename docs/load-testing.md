# Load Testing & Performance Guide

This guide details how load tests are structured and executed using Grafana k6.

---

## 1. Test Design & Traffic Stages

The k6 test suite in `tests/load/k6-load-test.js` exercises the read-heavy job board endpoints:
- `GET /api/jobs?limit=10` (Tests Redis cache-aside speed)
- `GET /api/jobs?q=Kubernetes` (Tests search filtering performance)
- `GET /health` (Tests health probe latency)

### Traffic Profile:
```
Virtual Users (VUs)
 150 ┤                    ┌────────────┐
     │                   ╱              ╲
  80 ┤            ┌─────┘                ╲
     │           ╱                        ╲
  20 ┤   ┌──────┘                          └──────┐
   0 ┼───┴────────┴───────┴──────────────┴────────┴──────► Time
        30s       1m      2m             1m      30s
```

---

## 2. Executing Load Tests

### Running with k6 CLI
```bash
# Run load test targeting local backend
k6 run tests/load/k6-load-test.js

# Target a remote staging or production endpoint
TARGET_URL="https://app.example.com" k6 run tests/load/k6-load-test.js
```

### Running via Automation Script
```bash
# Using Bash
./scripts/load-test.sh http://localhost:3001

# Using PowerShell
.\scripts\load-test.ps1 -TargetUrl "http://localhost:3001"
```

---

## 3. SLA Thresholds & Success Criteria

The test enforces strict service level objectives (SLOs):
- **p95 Latency**: `< 500ms`
- **p99 Latency**: `< 1000ms`
- **Error Rate**: `< 1%`
- **Exit Code**: Non-zero if thresholds are breached.
