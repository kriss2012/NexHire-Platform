# Platform Architecture Documentation

## 1. Executive Summary
The **JobBoard DevSecOps Platform** is an enterprise-grade cloud-native application designed to demonstrate the complete lifecycle of modern software delivery: from developer Git commit, automated testing, static and container security analysis, immutable artifact creation, Infrastructure as Code, to GitOps-driven reconciliation with ArgoCD on AWS EKS, monitored via Prometheus, Grafana, and Loki.

---

## 2. End-to-End Architectural Flow

```
Developer
    │
    │ git push
    ▼
GitHub Repository (main / develop)
    │
    ▼ Webhook trigger
GitHub Actions CI/CD
    ├── 1. Checkout repository
    ├── 2. Install dependencies (npm ci)
    ├── 3. Lint & Typecheck (tsc --noEmit)
    ├── 4. Unit & Integration tests (Jest & Supertest)
    ├── 5. Secret scanning (Gitleaks)
    ├── 6. Filesystem vulnerability scanning (Trivy)
    ├── 7. Multi-stage Docker build (Non-root Alpine)
    ├── 8. Container vulnerability scanning (Trivy)
    ├── 9. Software Bill of Materials (Syft SBOM)
    ├── 10. Push immutable image tagged with Git SHA to AWS ECR
    └── 11. Update desired state in GitOps repository
             │
             ▼
        GitOps Repository (Helm Values)
             │
             ▼ Automated sync & reconciliation
        ArgoCD Controller
             │
             ▼ Deploy / Rollout
        AWS EKS Kubernetes Cluster
             │
       ┌─────┴────────────────┐
       ▼                      ▼
  Frontend Pods          Backend Pods (2 - 10 replicas)
  (Nginx Alpine)         (Node.js + Express + TypeScript)
       │                      │
       │                      ├──► Redis 7 (Cache-Aside)
       │                      └──► PostgreSQL 16 (Relational DB)
       ▼                      ▼
    Kubernetes ClusterIP Services (:3000, :3001)
       │
       ▼
    Kubernetes Ingress (AWS Load Balancer Controller)
       │
       ▼
    AWS Application Load Balancer (ALB) - HTTPS / TLS 443
       │
       ▼
    End Users
```

---

## 3. Core Component Layers

### Application Tier
- **Frontend**: React 18, TypeScript, Vite, Vanilla CSS design tokens with glassmorphic aesthetic, responsive across mobile, tablet, and desktop. Communicates via REST APIs with `/api` and respects environment configurations (`VITE_API_URL`).
- **Backend**: Node.js, Express, TypeScript layered architecture (`controllers/`, `services/`, `repositories/`, `middleware/`, `validators/`, `health/`). Features JWT authentication, role-based access control (`USER`, `EMPLOYER`, `ADMIN`), rate limiting, parameterized queries, and structured JSON logging.
- **Database**: PostgreSQL 16 relational database with migrations (`001_initial_schema.sql`), foreign keys, cascading rules, unique indexes, and audit timestamps.
- **Cache Layer**: Redis 7 cache-aside architecture for read-heavy job searches (`/api/jobs`), invalidating pattern-matched keys upon job creation, updates, or deletions.

### Infrastructure Tier (Terraform)
- **VPC Module**: 3 Availability Zones, public subnets with ALB tags, private subnets for EKS worker nodes, and NAT Gateways.
- **Security Groups Module**: Zero-trust network segmentation. ALB allows 80/443; EKS nodes accept traffic strictly from ALB; Postgres and Redis only accept connections from EKS worker node security group.
- **ECR Module**: KMS-encrypted private container repositories with image tag immutability and scan-on-push enabled.
- **IAM Module**: GitHub Actions OIDC provider and least-privilege IAM roles (`AssumeRoleWithWebIdentity`) eliminating permanent AWS keys.
- **EKS Module**: Kubernetes 1.30 managed control plane, private managed node groups, KMS envelope encryption for Kubernetes Secrets.

### Deployment & GitOps Tier
- **Helm**: Parameterized multi-environment chart supporting `values-dev.yaml`, `values-staging.yaml`, and `values-production.yaml`.
- **ArgoCD**: Declarative application manifests with automated sync, prune, and self-heal.
- **Argo Rollouts**: Progressive canary deployment strategy (5% -> 25% -> 50% -> 100%) with automated metrics analysis and rollback.

### Observability Tier
- **Prometheus**: Scrapes `/metrics` from backend exposing HTTP request rates, error counters, latency histograms, and process metrics.
- **Grafana**: Production dashboard `JOBBOARD OVERVIEW` featuring 11 key operational panels.
- **Alertmanager**: Pager and webhook routing for critical alerts (5xx error rate > 5%, high latency, pod crashloops).
- **Loki**: Centralized log aggregation for structured JSON logs.
