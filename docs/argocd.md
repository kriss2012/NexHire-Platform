# ArgoCD GitOps Documentation

This guide describes how ArgoCD reconciles the desired Kubernetes state from Git into the AWS EKS cluster.

---

## 1. GitOps Architecture

```
Application Repository (Git)
         │
         │ CI generates immutable images (ECR)
         ▼
Desired State Manifests (helm/jobboard/values-*.yaml)
         │
         ▼ Poll / Webhook (Every 3 minutes)
ArgoCD Application Controller
         │
         ├── 1. Fetch Git targetRevision (e.g. main)
         ├── 2. Render Helm templates with environment values
         ├── 3. Compare with Live Kubernetes Cluster state (Diff calculation)
         │
         ▼ If Drift Detected:
Automatic Self-Healing & Synchronization
         │
         ├── Apply updated Deployments, Services, Ingress
         ├── Prune deprecated resources (if prune: true)
         │
         ▼
AWS EKS Cluster (State: Synced & Healthy)
```

---

## 2. Installing ArgoCD on Kubernetes

```bash
# 1. Create argocd namespace
kubectl create namespace argocd

# 2. Install official ArgoCD manifests
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 3. Wait for ArgoCD server pods to be Ready
kubectl -n argocd wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=300s

# 4. Retrieve initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo ""

# 5. Port-forward UI to localhost:8080
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

---

## 3. Registering JobBoard Application in ArgoCD

```bash
# Apply Root App-of-Apps or standalone Application
kubectl apply -f argocd/application.yaml

# Check Application synchronization status
kubectl -n argocd get applications
```
Expected output:
```
NAME                  SYNC STATUS   HEALTH STATUS
jobboard-production   Synced        Healthy
```

---

## 4. GitOps Drift Detection and Self-Healing Demo
1. Manually tamper with the cluster by deleting a deployment or changing replica count:
   ```bash
   kubectl -n jobboard scale deployment/jobboard-backend --replicas=0
   ```
2. Observe ArgoCD detect `OutOfSync`.
3. Within seconds, ArgoCD's `selfHeal: true` policy automatically restores the deployment back to the Git-defined replica count (`replicas: 2`).
