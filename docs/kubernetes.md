# Kubernetes Deployment Guide

This document details the production Kubernetes architecture for the JobBoard platform running in namespace `jobboard`.

---

## 1. Resource Overview

| Resource | File | Purpose | Key Configurations |
|---|---|---|---|
| **Namespace** | `namespace.yaml` | Workload isolation | `jobboard` with standard labels |
| **ResourceQuota** | `resourcequota.yaml` | Guardrails | 8 CPUs, 16Gi memory, 30 pods max |
| **LimitRange** | `limitrange.yaml` | Default pod sizing | Default container request: 100m CPU / 128Mi RAM |
| **ServiceAccount** | `serviceaccount.yaml` | Non-default identity | `jobboard-app-sa` with disabled auto-mount token |
| **RBAC** | `rbac.yaml` | Least privilege | Scoped Role & RoleBinding (Read ConfigMaps/Endpoints only) |
| **NetworkPolicy** | `networkpolicy.yaml` | Zero-Trust isolation | Strict ingress/egress rules for DB, Redis, Backend, Frontend |
| **ConfigMap** | `configmap.yaml` | Application configuration | Ports, URLs, Log levels, CORS origins |
| **Secret** | `secret.yaml` | Sensitive credentials | Database password, JWT secret |
| **PostgreSQL** | `postgres.yaml` | Relational database | StatefulSet, 5Gi PVC, `pg_isready` probes |
| **Redis** | `redis.yaml` | Cache layer | Deployment, AOF enabled, `redis-cli ping` probes |
| **Backend** | `backend-deployment.yaml` | REST API | 2 replicas, RollingUpdate, Non-root, 3 Probes |
| **Backend Service** | `backend-service.yaml` | Internal routing | ClusterIP port 3001 |
| **Backend HPA** | `backend-hpa.yaml` | Horizontal autoscaling | Min 2, Max 10, Target 70% CPU / 80% RAM |
| **Backend PDB** | `backend-pdb.yaml` | High availability | `minAvailable: 1` during node maintenance |
| **Frontend** | `frontend-deployment.yaml` | Client application | 2 replicas, Nginx unprivileged, Non-root |
| **Frontend Service** | `frontend-service.yaml` | Internal routing | ClusterIP port 3000 |
| **Ingress** | `ingress.yaml` | External routing | AWS ALB Ingress Controller, TLS 443 redirect |

---

## 2. Deploying to Kubernetes

### Dry-Run Syntax & Validation
```bash
kubectl apply -f kubernetes/ --dry-run=client
```

### Applying Manifests to Cluster
```bash
# 1. Create namespace & governance policies
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/resourcequota.yaml
kubectl apply -f kubernetes/limitrange.yaml

# 2. Apply Security & Network Policies
kubectl apply -f kubernetes/serviceaccount.yaml
kubectl apply -f kubernetes/rbac.yaml
kubectl apply -f kubernetes/networkpolicy.yaml

# 3. Apply Configuration & Secrets
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secret.yaml

# 4. Deploy Data Stores
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/redis.yaml

# Wait for database ready
kubectl -n jobboard wait --for=condition=ready pod -l app=jobboard-postgres --timeout=120s

# 5. Deploy Applications & Ingress
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml
kubectl apply -f kubernetes/backend-hpa.yaml
kubectl apply -f kubernetes/backend-pdb.yaml
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
kubectl apply -f kubernetes/ingress.yaml
```

---

## 3. Verifying Pods and Health Checks

```bash
# Check all pods in namespace
kubectl -n jobboard get pods -o wide

# Check services
kubectl -n jobboard get svc

# Inspect backend deployment and rolling status
kubectl -n jobboard rollout status deployment/jobboard-backend

# Check HPA status
kubectl -n jobboard get hpa
```

---

## 4. Zero-Trust NetworkPolicy Testing
Verify that direct unauthorized access to PostgreSQL is blocked:
```bash
# 1. Attempt connection from Frontend pod to PostgreSQL (SHOULD FAIL)
kubectl -n jobboard exec -it deployment/jobboard-frontend -- nc -zv -w 3 jobboard-postgres 5432 || echo "Blocked by NetworkPolicy (PASS)"

# 2. Attempt connection from Backend pod to PostgreSQL (SHOULD SUCCEED)
kubectl -n jobboard exec -it deployment/jobboard-backend -- nc -zv -w 3 jobboard-postgres 5432
```
