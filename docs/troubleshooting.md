# Operational Troubleshooting Guide

This guide contains essential diagnostic commands for resolving runtime, deployment, and infrastructure issues.

---

## 1. Kubernetes Diagnostics

```bash
# 1. View all pods and status in jobboard namespace
kubectl -n jobboard get pods -o wide

# 2. Inspect failing pod details & events
kubectl -n jobboard describe pod <pod-name>

# 3. Stream real-time logs from backend containers
kubectl -n jobboard logs -l app=jobboard-backend --tail=100 -f

# 4. Check cluster events (sorted by timestamp)
kubectl -n jobboard get events --sort-by='.metadata.creationTimestamp'

# 5. Check Ingress and Load Balancer address
kubectl -n jobboard get ingress jobboard-ingress

# 6. Check Service endpoints and target ports
kubectl -n jobboard get endpoints

# 7. Check HPA scaling status
kubectl -n jobboard get hpa

# 8. Rollout history and status
kubectl -n jobboard rollout status deployment/jobboard-backend
kubectl -n jobboard rollout history deployment/jobboard-backend
kubectl -n jobboard rollout undo deployment/jobboard-backend
```

---

## 2. Docker & Container Diagnostics

```bash
# Check container status and healthchecks
docker compose ps

# View container resource consumption (CPU & RAM)
docker stats --no-stream

# View detailed container inspect
docker inspect jobboard-backend

# Execute interactive shell inside running container
docker exec -it jobboard-backend sh
```

---

## 3. ArgoCD GitOps Diagnostics

```bash
# View all registered ArgoCD applications
kubectl -n argocd get applications

# Check application sync details
argocd app get jobboard-production

# Force immediate hard synchronization
argocd app sync jobboard-production --force --prune

# Inspect controller logs
kubectl -n argocd logs -l app.kubernetes.io/name=argocd-application-controller -f
```

---

## 4. Terraform Diagnostics

```bash
# Validate syntax offline
terraform validate

# Inspect current deployed state resources
terraform state list

# Refresh state against cloud provider
terraform refresh
```
