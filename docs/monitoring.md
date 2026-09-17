# Monitoring & Observability Guide

The JobBoard platform exposes granular telemetry metrics and provides pre-configured dashboards and alert evaluation rules.

---

## 1. Application Metrics Architecture

The backend REST API instrumented via `prom-client` exposes operational metrics on `GET /metrics`:

| Metric Name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method`, `path`, `status` | Total HTTP requests handled |
| `http_request_duration_seconds` | Histogram | `method`, `path`, `status` | Request latency distribution |
| `http_active_requests` | Gauge | None | Number of in-flight active HTTP requests |
| `redis_cache_hits_total` | Counter | `cache_key` | Redis cache hits (Cache-Aside pattern) |
| `redis_cache_misses_total` | Counter | `cache_key` | Redis cache misses falling back to PostgreSQL |
| `process_cpu_seconds_total` | Counter | None | Node.js process CPU consumption |
| `process_resident_memory_bytes`| Gauge | None | Memory working set size (RSS) |

---

## 2. Inspecting Metrics Locally

```bash
# Query raw Prometheus metrics from backend
curl -s http://localhost:3001/metrics | head -n 35
```

---

## 3. Grafana Production Dashboard (`JOBBOARD OVERVIEW`)

The provisioned dashboard (`monitoring/grafana/dashboards/jobboard-overview.json`) contains 11 panels:
1. **Requests/sec (RPS)**: `sum(rate(http_requests_total[1m])) by (method, status)`
2. **Error Rate (5xx %)**: `(sum(rate(http_requests_total{status=~"5.."}[1m])) / sum(rate(http_requests_total[1m]))) * 100`
3. **P95 Latency (ms)**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le)) * 1000`
4. **P99 Latency (ms)**: `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[1m])) by (le)) * 1000`
5. **CPU Utilization (%)**: `sum(rate(process_cpu_seconds_total[1m])) * 100`
6. **Memory Working Set (MB)**: `process_resident_memory_bytes / 1024 / 1024`
7. **HPA Target & Replicas**: Desired vs current replica count
8. **Active Pod Count**: `count(up{job="jobboard-backend"} == 1)`
9. **Pod Restarts**: `sum(increase(kube_pod_container_status_restarts_total[1h]))`
10. **PostgreSQL Availability**: Query connectivity heartbeat
11. **Redis Cache Hit Ratio**: Percentage of read queries satisfied from cache

---

## 4. Alertmanager Rules & Policies

Configured in `monitoring/prometheus/alert.rules.yml`:
- **HighErrorRate**: Fires if HTTP 5xx error rate exceeds 5% over 5 minutes.
- **HighLatency**: Fires if 95th percentile latency exceeds 500ms for 5 minutes.
- **ApplicationUnavailable**: Fires if backend instances report `up == 0` for 1 minute.
- **PodRestartSpike**: Fires if a container restarts > 3 times in 10 minutes.
