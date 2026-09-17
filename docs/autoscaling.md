# Horizontal Pod Autoscaling (HPA) Guide

This guide details how the JobBoard backend autoscales dynamically based on real-time traffic demand.

---

## 1. HPA Architecture & Configuration

The backend `HorizontalPodAutoscaler` (`kubernetes/backend-hpa.yaml`) regulates replica counts:
- **Minimum Replicas**: `2` (Ensures continuous high availability)
- **Maximum Replicas**: `10`
- **Target CPU Utilization**: `70%`
- **Target Memory Utilization**: `80%`
- **Scale-Up Policy**: Immediate (0s stabilization window; increases up to 100% capacity every 15s)
- **Scale-Down Policy**: Conservative (300s stabilization window; decreases at most 20% capacity every 60s to avoid flapping)

---

## 2. Demonstrating Autoscaling with k6 Load Testing

### Step 1: Observe Baseline State
```bash
# Verify initial baseline of 2 pods
kubectl -n jobboard get pods -l app=jobboard-backend
kubectl -n jobboard get hpa jobboard-backend-hpa
```
Expected output:
```
NAME                   REFERENCE                         TARGETS   MINPODS   MAXPODS   REPLICAS
jobboard-backend-hpa   Deployment/jobboard-backend       4%/70%    2         10        2
```

### Step 2: Generate Traffic Spike via k6
```bash
# Run load testing script (spikes up to 150 concurrent virtual users)
k6 run tests/load/k6-load-test.js
```

### Step 3: Observe HPA Scaling Up
```bash
# Watch HPA metrics and replica count changes in real-time
kubectl -n jobboard get hpa jobboard-backend-hpa -w
```
Traffic progression:
```
2 pods (baseline)
   │ (traffic spikes to 80 VUs -> CPU exceeds 70%)
   ▼
4 pods
   │ (peak traffic at 150 VUs)
   ▼
6 - 8 pods
```

### Step 4: Observe Cool-Down & Scale-Down
Once the load test finishes, traffic drops to 0. After the 300s stabilization window expires, the HPA smoothly scales pods down:
```
6 pods ──► 4 pods ──► 2 pods (healthy baseline)
```
