# Automated Rollback & Deployment Failure Recovery

This document explains the automated and manual rollback mechanisms implemented to safeguard production stability.

---

## 1. Automated Rollback Architecture

```
Version 1 (Working: v1.0.0) ──► 100% Traffic Healthy
         │
         │ New deployment triggered
         ▼
Version 2 (Broken Image: invalid tag or failing /ready probe)
         │
         ├── 1. Kubernetes creates replacement pod
         ├── 2. startupProbe & readinessProbe check GET /ready
         │
         ▼ Readiness check fails:
Readiness Probe: FAIL (Container Not Ready)
         │
         ├── Kubernetes halts rolling update (maxUnavailable: 0 prevents old pod deletion)
         ├── Broken pod NEVER receives traffic
         ├── Argo Rollouts analysis template detects error rate spike > 2%
         │
         ▼ Automated Action:
Rollback Triggered
         │
         ├── Rollout aborts and steps back to Revision 1
         └── Previous version remains 100% healthy with ZERO downtime
```

---

## 2. Reproducible Rollback Demonstration Test

### Step 1: Deploy a Deliberately Broken Image Tag
```bash
# Update deployment with an invalid/non-existent image tag
kubectl -n jobboard set image deployment/jobboard-backend backend=123456789012.dkr.ecr.us-east-1.amazonaws.com/jobboard-backend:broken-v999
```

### Step 2: Observe Deployment Stalling
```bash
# Check rollout status
kubectl -n jobboard rollout status deployment/jobboard-backend --timeout=30s
```
Output:
```
Waiting for deployment "jobboard-backend" rollout to finish: 1 out of 2 new replicas have been updated...
```

### Step 3: Inspect Pod State & Probe Failure
```bash
kubectl -n jobboard get pods -l app=jobboard-backend
```
Notice: The 2 original `v1.0.0` pods remain `2/2 Running` serving traffic. The new broken pod is in `ImagePullBackOff` or unready, receiving 0% of user traffic.

### Step 4: Trigger Automated / Manual Undo
```bash
# View rollout revision history
kubectl -n jobboard rollout history deployment/jobboard-backend

# Roll back to the previous stable revision
kubectl -n jobboard rollout undo deployment/jobboard-backend
```
Output:
```
deployment.apps/jobboard-backend rolled back
```

### Step 5: Verify Restoration
```bash
kubectl -n jobboard get pods -l app=jobboard-backend
```
All pods return to `Running` and `Ready` with version `v1.0.0`.
