# Helm Deployment Guide

The `helm/jobboard` chart packages the complete platform into a parameterized, reusable deployment bundle supporting multiple environment profiles.

---

## 1. Directory Structure

```
helm/jobboard/
├── Chart.yaml                  # Chart metadata and version
├── values.yaml                 # Base defaults
├── values-dev.yaml             # Development environment overrides
├── values-staging.yaml         # Staging environment overrides
├── values-production.yaml      # Production environment overrides
└── templates/
    ├── _helpers.tpl            # Template helper macros
    ├── configmap.yaml          # ConfigMap template
    ├── secret.yaml             # Secret template
    ├── serviceaccount.yaml     # ServiceAccount template
    ├── rbac.yaml               # RBAC Role and Binding template
    ├── networkpolicy.yaml      # NetworkPolicy template
    ├── deployment-backend.yaml # Backend Deployment template
    ├── service-backend.yaml    # Backend Service template
    ├── deployment-frontend.yaml# Frontend Deployment template
    ├── service-frontend.yaml   # Frontend Service template
    ├── deployment-postgres.yaml# PostgreSQL StatefulSet template
    ├── service-postgres.yaml   # PostgreSQL Service template
    ├── deployment-redis.yaml   # Redis Deployment template
    ├── service-redis.yaml      # Redis Service template
    ├── hpa.yaml                # HPA template
    ├── pdb.yaml                # PodDisruptionBudget template
    └── ingress.yaml            # ALB Ingress template
```

---

## 2. Validation Commands

### Lint the Chart
```bash
helm lint helm/jobboard
```
Expected output:
```
1 chart(s) linted, 0 chart(s) failed
```

### Template Rendering (Dry Run)
Verify that all variables render into valid Kubernetes YAML without errors:

```bash
# Render Base values
helm template jobboard helm/jobboard

# Render Dev environment
helm template jobboard helm/jobboard -f helm/jobboard/values-dev.yaml

# Render Production environment with custom image tag
helm template jobboard helm/jobboard \
  -f helm/jobboard/values-production.yaml \
  --set backend.image.tag=sha-abc1234 \
  --set frontend.image.tag=sha-abc1234
```

---

## 3. Installation & Upgrades

### Install / Upgrade in Development
```bash
helm upgrade --install jobboard-dev helm/jobboard \
  --namespace jobboard-dev \
  --create-namespace \
  -f helm/jobboard/values-dev.yaml
```

### Install / Upgrade in Production
```bash
helm upgrade --install jobboard-prod helm/jobboard \
  --namespace jobboard \
  --create-namespace \
  -f helm/jobboard/values-production.yaml \
  --set backend.image.tag="v1.2.0" \
  --set frontend.image.tag="v1.2.0" \
  --wait --timeout 5m
```

### Rollback Helm Release
```bash
# View release revision history
helm history jobboard-prod -n jobboard

# Rollback to previous revision
helm rollback jobboard-prod 1 -n jobboard
```
