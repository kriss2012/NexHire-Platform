# Structured Logging & Loki Documentation

## 1. Structured JSON Logging Architecture

The backend utilizes `winston` configured to emit single-line JSON log events to `stdout`.

### Sample Output Format:
```json
{
  "timestamp": "2026-09-15T11:00:15.123Z",
  "level": "info",
  "service": "backend",
  "message": "HTTP Request Handled",
  "method": "GET",
  "path": "/api/jobs?limit=10",
  "status": 200,
  "durationMs": 4,
  "ip": "10.0.12.45"
}
```

### Sensitive Data Masking Policy
The logging middleware automatically redacts sensitive parameters. Any field named `password`, `token`, `authorization`, `secret`, `key`, or `jwt` is replaced with `[REDACTED]`.

---

## 2. Centralized Log Aggregation with Loki

Kubernetes containers write structured JSON directly to their container stdout/stderr. Promtail or the Grafana Alloy agent ships these logs directly to Loki.

### Querying Logs in Grafana (LogQL)

```logql
# Find all 5xx errors across backend pods in the last 15 minutes
{namespace="jobboard", app="jobboard-backend"} | json | status >= 500

# Inspect slow API queries (> 200ms)
{namespace="jobboard", app="jobboard-backend"} | json | durationMs > 200

# Filter logs mentioning database or connection errors
{namespace="jobboard"} |= "database" |= "error"
```
