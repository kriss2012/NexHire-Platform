# Chaos Engineering & Resilience Testing Guide

This guide documents the 6 resilience and chaos scenarios executed against development/staging to validate cluster self-healing, autoscaling, and fault tolerance.

> [!WARNING]
> Only perform chaos experiments in `dev` or `staging` environments. Never execute destructive chaos experiments directly in production.

---

## Scenario 1: Abrupt Backend Pod Termination (Self-Healing)

### Objective
Verify that Kubernetes ReplicaSet controller detects missing pods and provisions replacements immediately without dropping user traffic.

### Execution
```bash
# 1. Identify active backend pods
kubectl -n jobboard get pods -l app=jobboard-backend

# 2. Terminate one backend pod abruptly
POD_TO_KILL=$(kubectl -n jobboard get pods -l app=jobboard-backend -o jsonpath="{.items[0].metadata.name}")
kubectl -n jobboard delete pod $POD_TO_KILL --grace-period=0 --force
```

### Expected Result
- The surviving replica continues serving traffic (PDB `minAvailable: 1` guarantees availability).
- Kubernetes immediately schedules a replacement pod.
- Within ~5 seconds, the new pod passes its `readinessProbe` and reaches `Running (Ready)` state.

---

## Scenario 2: Traffic Surge & CPU Saturation (HPA Scaling)

### Objective
Verify that high concurrency forces CPU utilization past 70%, triggering the Horizontal Pod Autoscaler.

### Execution
```bash
# Launch k6 traffic spike
k6 run tests/load/k6-load-test.js
```

### Expected Result
- CPU target exceeds 70%.
- HPA scales backend replicas: `2 pods -> 4 pods -> 6 pods`.
- P95 latency remains under 500ms.
- Traffic subsides -> HPA smoothly scales back down to 2 replicas after cool-down window.

---

## Scenario 3: Deploying a Broken Image Tag (Rollout Stalling)

### Objective
Verify that a broken image or failing healthcheck does NOT replace healthy pods.

### Execution
```bash
# Deploy non-existent image
kubectl -n jobboard set image deployment/jobboard-backend backend=invalid.ecr.internal/jobboard-backend:v-broken
```

### Expected Result
- New pod enters `ImagePullBackOff` or probe failure.
- `maxUnavailable: 0` ensures existing healthy pods remain active.
- Rollout stalls; user traffic experiences zero downtime.
- Run `kubectl -n jobboard rollout undo deployment/jobboard-backend` to revert.

---

## Scenario 4: Delete Frontend Pod

### Objective
Verify frontend resilience.

### Execution
```bash
kubectl -n jobboard delete pod -l app=jobboard-frontend --grace-period=0 --force
```

### Expected Result
- Replacement Nginx pod starts in < 3 seconds.
- No downtime observed on Ingress or ALB.

---

## Scenario 5: Temporary Redis Cache Disruption

### Objective
Verify that the application gracefully degrades to direct PostgreSQL queries if Redis is restarted or offline.

### Execution
```bash
# Restart Redis pod
kubectl -n jobboard delete pod -l app=jobboard-redis
```

### Expected Result
- `GET /api/jobs` queries continue to succeed, setting `X-Cache: MISS`.
- Redis client auto-reconnects as soon as the Redis pod restarts.
- Backend does NOT crash or restart.

---

## Scenario 6: Database Connectivity Degradation

### Objective
Verify that database connectivity loss marks the backend as Unready (removing it from service endpoints) WITHOUT triggering cascading container crash loops.

### Execution
```bash
# Temporarily pause or restrict PostgreSQL service
kubectl -n jobboard scale statefulset/jobboard-postgres --replicas=0
```

### Expected Result
- Backend `/ready` probe returns `503` degraded state.
- Kubernetes removes the pod from Endpoints so new requests are not sent to failing instances.
- Backend process remains alive (`/live` probe stays `200`), preventing useless cascading container restart loops.
- Restore replicas (`--replicas=1`); `/ready` returns `200` within 10 seconds.
