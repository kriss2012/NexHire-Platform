# JobBoard DevSecOps Platform

> A production-grade cloud-native job board platform demonstrating GitHub Actions CI/CD, Docker, AWS ECR, Terraform, Kubernetes, AWS EKS, Helm, ArgoCD GitOps, DevSecOps, Prometheus & Grafana observability, Horizontal Pod Autoscaling (HPA), and automated canary rollback.

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=github-actions)](https://github.com/example-org/jobboard-devops/actions)
[![Security Scan](https://img.shields.io/badge/Security-Trivy%20%26%20Gitleaks%20Passed-6366f1?style=for-the-badge&logo=shield)](https://github.com/example-org/jobboard-devops/actions)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-1.30-326ce5?style=for-the-badge&logo=kubernetes)](https://kubernetes.io)
[![GitOps](https://img.shields.io/badge/GitOps-ArgoCD%20Synced-f97316?style=for-the-badge&logo=argo)](https://argoproj.github.io/cd/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform%20AWS-7b42bc?style=for-the-badge&logo=terraform)](https://terraform.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## Architecture Diagram

```
Developer
   │
   │ git push
   ▼
GitHub Repository (main / develop)
   │
   ▼ Webhook trigger
GitHub Actions CI/CD
┌──────────────────────────────────────────────────────────┐
│  1. Checkout Code                                        │
│  2. Node.js 22 & Dependency Cache (npm ci)               │
│  3. Strict Linting & Typecheck (tsc --noEmit)            │
│  4. Unit, Integration, and Health Probe Tests (Jest)     │
│  5. Secret Scanning (Gitleaks)                           │
│  6. Vulnerability Scanning (Trivy Filesystem)            │
│  7. Multi-Stage Docker Builds (Non-root Alpine)          │
│  8. Container Vulnerability Scanning (Trivy)             │
│  9. SBOM Generation (Anchore Syft)                       │
│ 10. Push Immutable Git SHA Images to AWS ECR (OIDC)      │
│ 11. Update Desired State in GitOps Repository            │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
                    AWS ECR Registry
                           │
                           ▼
                    GitOps Manifests (Helm Values)
                           │
                           ▼ Automated Reconciliation
                    ArgoCD Controller
                           │
                           ▼
         AWS EKS Kubernetes Cluster (v1.30)
 ┌─────────────────────────┴─────────────────────────────┐
 │  jobboard Namespace (Zero-Trust NetworkPolicies, RBAC)│
 │                                                       │
 │  ┌───────────────────────┐   ┌──────────────────────┐ │
 │  │ Frontend Pods (:3000) │   │ Backend Pods (:3001) │ │
 │  │ Nginx Alpine (Non-root│   │ Node.js Express + TS │ │
 │  │ 2 Replicas            │   │ 2 - 10 Pods (HPA 70%)│ │
 │  └───────────┬───────────┘   └──────────┬───────────┘ │
 │              │                          │             │
 │              │                          ├──► Redis 7  │
 │              │                          │    (Cache)  │
 │              │                          └──► Postgres │
 │              │                               (16 DB)  │
 │              ▼                          ▼             │
 │        ClusterIP Service          ClusterIP Service   │
 │              │                          │             │
 │              └──────────────┬───────────┘             │
 │                             ▼                         │
 │                   Kubernetes Ingress                  │
 └─────────────────────────────┬─────────────────────────┘
                               │
                               ▼
            AWS Application Load Balancer (ALB) - TLS 443
                               │
                               ▼
                           End Users

 Observability & Telemetry:
 ┌───────────────────────────────────────────────────────┐
 │ Prometheus (Scrapes /metrics) ──► Grafana (11 Panels) │
 │ Alertmanager (5xx Alerts)     ──► Loki (JSON Logs)    │
 └───────────────────────────────────────────────────────┘
```

---

## 1. Overview
The **JobBoard DevSecOps Platform** is not a static mockup or synthetic YAML template—it is an executable, end-to-end full-stack platform built specifically to showcase senior cloud, platform, and DevSecOps engineering competencies:
- Real REST API with TypeScript, PostgreSQL, and Redis caching.
- Production React 18 client with interactive search, faceted filters, and dashboards.
- Zero-downtime rolling updates and progressive canary rollouts.
- Zero-trust network segmentation and least-privilege security controls.
- Comprehensive automated testing and real telemetry observability.

---

## 2. Core Features
- **Job Seeker Experience**: Search by keyword/tech, filter by employment type, remote toggle, location filter, pagination, bookmarking, and instant resume application modal.
- **Employer Portal**: Post new positions with salary ranges and bulleted requirements, view applicant pipelines, and advance applicant statuses.
- **Admin Control Plane**: Real-time system telemetry (CPU, Memory RSS, PostgreSQL latency, Redis hit/miss ratio, total accounts).
- **Recruiter 1-Click Fast Switcher**: Embedded toolbar allowing instant login as `ADMIN`, `EMPLOYER`, or `USER` without typing passwords.
- **Resilient Cache-Aside Pattern**: Redis caching with automated cache invalidation upon job changes.
- **Health Probes**: Kubernetes-native `/health`, `/ready`, `/live`, and `/metrics`.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Vanilla CSS Design System, Lucide Icons |
| **Backend** | Node.js 22, Express.js, TypeScript, Winston (JSON Logger), Zod |
| **Database** | PostgreSQL 16 (Parameterized SQL, Migrations, Foreign Keys, Indexes) |
| **Cache** | Redis 7 (Cache-Aside, TTL, Pattern Invalidation, Hit/Miss Metrics) |
| **Containers** | Multi-stage Dockerfiles, Non-root (`10001` / `101`), `dumb-init` |
| **Orchestration** | Kubernetes 1.30 (StatefulSet, Deployments, Services, Ingress, HPA, PDB) |
| **Packaging** | Helm 3 (`helm/jobboard`, environments: `dev`, `staging`, `production`) |
| **Infrastructure (IaC)** | Terraform (`aws_vpc`, `aws_security_group`, `aws_ecr`, `aws_iam`, `aws_eks`) |
| **CI/CD & Security** | GitHub Actions, AWS OIDC, Gitleaks, Trivy, Anchore Syft (SBOM) |
| **GitOps** | ArgoCD (Declarative Applications, Self-Healing, App-of-Apps) |
| **Canary & Rollback** | Argo Rollouts (5% -> 25% -> 50% -> 100% traffic shifting, AnalysisTemplate) |
| **Observability** | Prometheus, Grafana (11-panel dashboard), Alertmanager, Loki |
| **Testing** | Jest, Supertest, k6 (Load & HPA traffic generation) |

---

## 4. Repository Structure

```
jobboard-devops/
├── frontend/                     # React + TypeScript + Vite + Vanilla CSS
│   ├── src/
│   │   ├── components/           # Navbar, JobCard, FilterSidebar, ApplicationModal, StatusBadge
│   │   ├── pages/                # BrowseJobs, JobDetail, EmployerDashboard, AdminDashboard, SavedJobs
│   │   ├── context/              # AuthContext (JWT session + 1-Click Demo Logins)
│   │   ├── services/             # Fetch REST API client
│   │   ├── types/                # TypeScript shared interfaces
│   │   ├── App.tsx, main.tsx
│   │   └── index.css             # High-polish design system tokens & animations
│   ├── nginx.conf                # Hardened Nginx configuration with security headers
│   └── Dockerfile                # Multi-stage build (Node build -> Nginx Alpine)
│
├── backend/                      # Layered Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/               # env.ts, database.ts (PG pool + fallback), redis.ts, logger.ts
│   │   ├── controllers/          # auth, jobs, applications, savedJobs, companies, admin, health, metrics
│   │   ├── middleware/           # auth, rbac, errorHandler, rateLimiter, requestLogger, validation
│   │   ├── repositories/         # Parameterized SQL database queries
│   │   ├── services/             # Business logic + Redis Cache-Aside layer
│   │   ├── validators/           # Zod schema definitions
│   │   ├── health/               # /health, /ready, /live probe handlers
│   │   ├── utils/                # JWT, password hashing, prom-client metrics
│   │   ├── db/                   # migrations/001_initial_schema.sql, migrate.ts, seed.ts
│   │   ├── app.ts, server.ts
│   ├── tests/                    # Unit, integration, and API tests (28 passed)
│   └── Dockerfile                # Multi-stage build (Node build -> minimal non-root runtime)
│
├── tests/
│   └── load/                     # k6 scripts for HPA scaling and smoke testing
├── docker/                       # Container configs, Dockerfiles, and Nginx reverse proxy
├── docker-compose.yml            # Local 4-container orchestration (frontend, backend, postgres, redis)
├── kubernetes/                   # Vanilla Kubernetes manifests (Namespace, NetworkPolicy, RBAC, HPA, PDB, Ingress)
├── helm/jobboard/                # Parameterized Helm chart with dev, staging, production values
├── terraform/                    # Modular IaC for AWS VPC, ECR, IAM OIDC, and EKS
├── argocd/                       # GitOps Application manifests and Canary Argo Rollouts
├── monitoring/                   # Prometheus rules, Grafana 11-panel dashboard, Loki, Alertmanager
├── scripts/                      # Cross-platform validation, build, test, and backup scripts (Bash & PowerShell)
├── docs/                         # 18 exhaustive technical documentation guides
├── .github/workflows/            # 6 decoupled CI/CD, DevSecOps, and GitOps workflows
├── Makefile                      # Standardized make targets (dev, test, lint, build, docker-up)
├── .env.example                  # Safe configuration defaults template
├── README.md                     # This master document
└── LICENSE                       # MIT License
```

---

## 5. Local Quickstart (Development)

### Option A: Bare-Metal Node.js
```bash
# 1. Clone & copy environment configuration
git clone https://github.com/example-org/jobboard-devops.git
cd jobboard-devops
cp .env.example .env

# 2. Run automated validation (lint, build, tests)
powershell ./scripts/validate.ps1
# (or ./scripts/validate.sh on Linux)

# 3. Start Backend (Terminal 1)
cd backend && npm run seed && npm run dev

# 4. Start Frontend (Terminal 2)
cd frontend && npm run dev
```
Visit `http://localhost:3000` in your browser.

### Option B: Complete Docker Compose Stack
```bash
# Build and run all 4 containers in background
docker compose up -d --build

# Verify healthy status
docker compose ps
```
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`
- **Prometheus Metrics**: `http://localhost:3001/metrics`
- **Health Check**: `http://localhost:3001/health`

---

## 6. Pre-Seeded Demonstration Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **ADMIN** | `admin@jobboard.io` | `Admin123!` | System stats, user directory, manage any listing |
| **EMPLOYER** | `recruiter@techcorp.io` | `Employer123!` | Post jobs, edit jobs, review applicant submissions |
| **USER** | `alex.dev@cloud.io` | `Applicant123!` | Search, bookmark jobs, apply for positions |

*Tip: Use the 1-Click "DEMO:" buttons in the top navbar to log in instantly without typing!*

---

## 7. Testing & Quality Verification

```bash
# 1. Run backend unit & integration tests (28 passing tests)
cd backend && npm test

# 2. Run frontend build verification
cd ../frontend && npm run build

# 3. Execute k6 load test simulating HPA traffic spike
k6 run tests/load/k6-load-test.js
```

---

## 8. 5-Minute Recruiter Demonstration Procedure

Follow this 5-minute walkthrough to demonstrate all platform capabilities:

### Minute 0–1: Architectural Tour
1. Open the repository root. Show:
   - Modern React/TypeScript frontend and layered Express/TypeScript backend.
   - Terraform modules (`vpc`, `security_groups`, `ecr`, `iam`, `eks`).
   - Vanilla Kubernetes manifests and Helm chart (`helm/jobboard`).
   - GitHub Actions workflows in `.github/workflows/`.
   - ArgoCD GitOps configuration in `argocd/`.

### Minute 1–2: Automated CI/CD & DevSecOps
1. Push a code change to `main`.
2. Inspect GitHub Actions pipeline:
   - **Tests**: 28 Jest tests pass with coverage.
   - **Lint**: TypeScript strict mode passes.
   - **Gitleaks**: Zero secrets detected.
   - **Trivy**: Container images scanned for CVEs.
   - **Syft**: SBOM generated (`spdx-json`).
   - **ECR**: Image pushed with immutable Git SHA tag.

### Minute 2–3: GitOps Reconciliation (ArgoCD)
1. Open ArgoCD dashboard.
2. Show Application status: `Synced` & `Healthy`.
3. Open terminal and inspect live Kubernetes pods:
   ```bash
   kubectl -n jobboard get pods -o wide
   ```
4. Demonstrate self-healing by deleting a pod; observe Kubernetes instantly recreate it.

### Minute 3–4: Live Metrics & Autoscaling (HPA)
1. Open Grafana `JOBBOARD OVERVIEW` dashboard (11 panels).
2. Note baseline: 2 pods, healthy database, active Redis cache.
3. Launch k6 load test:
   ```bash
   k6 run tests/load/k6-load-test.js
   ```
4. Watch Grafana and terminal as CPU spikes over 70%:
   ```
   2 pods ──► 4 pods ──► 6 pods
   ```

### Minute 4–5: Failure Detection & Rollback
1. Deploy an intentionally broken version:
   ```bash
   kubectl -n jobboard set image deployment/jobboard-backend backend=invalid-ecr/backend:broken
   ```
2. Observe rollout stalling: healthy pods continue serving 100% of user traffic with zero downtime.
3. Roll back:
   ```bash
   kubectl -n jobboard rollout undo deployment/jobboard-backend
   ```
4. Re-verify: Cluster remains completely healthy!

---

## 9. Comprehensive Documentation Index

Explore our 18 in-depth technical guides located in `docs/`:
1. [Architecture Guide](docs/architecture.md)
2. [Local Development](docs/local-development.md)
3. [Docker & Containers](docs/docker.md)
4. [Kubernetes Manifests](docs/kubernetes.md)
5. [Helm Chart Packaging](docs/helm.md)
6. [Terraform IaC](docs/terraform.md)
7. [AWS Cloud Setup](docs/aws.md)
8. [GitHub Actions CI/CD](docs/github-actions.md)
9. [ArgoCD GitOps](docs/argocd.md)
10. [DevSecOps Security](docs/security.md)
11. [Monitoring & Metrics](docs/monitoring.md)
12. [Structured Logging](docs/logging.md)
13. [Autoscaling (HPA)](docs/autoscaling.md)
14. [Automated Rollback](docs/rollback.md)
15. [Disaster Recovery](docs/disaster-recovery.md)
16. [Troubleshooting](docs/troubleshooting.md)
17. [Chaos Engineering](docs/chaos-testing.md)
18. [Load Testing](docs/load-testing.md)

---

jobboard-devops/
├── frontend/                     # React + TypeScript + Vite + Vanilla CSS design system
│   ├── src/
│   │   ├── components/           # Navbar, Footer, JobCard, FilterSidebar, Modal, StatusBadge, etc.
│   │   ├── pages/                # Home, Jobs, JobDetail, Login, Register, Dashboard, Employer, Admin
│   │   ├── context/              # AuthContext (JWT session, roles USER/EMPLOYER/ADMIN)
│   │   ├── services/             # API clients (auth, jobs, applications, companies)
│   │   ├── types/                # TypeScript shared interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css             # High-polish design system tokens, themes, animations
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── nginx.conf                # Production SPA Nginx configuration with security headers
│   └── Dockerfile                # Multi-stage build (Node build -> Nginx Alpine unprivileged)
│
├── backend/                      # Node.js + TypeScript + Express.js layered architecture
│   ├── src/
│   │   ├── config/               # env variables, pg pool, redis client, winston logger
│   │   ├── controllers/          # auth, jobs, applications, savedJobs, companies, admin, health, metrics
│   │   ├── middleware/           # auth (JWT), rbac, errorHandler, rateLimiter, requestLogger, validation
│   │   ├── repositories/         # Postgres queries (parameterized SQL preventing injection)
│   │   ├── services/             # Business logic + Redis caching layer (cache-aside pattern)
│   │   ├── validators/           # Zod/Joi input validation schemas
│   │   ├── health/               # /health, /ready, /live probe handlers
│   │   ├── db/
│   │   │   ├── migrations/       # SQL migrations (001_init.sql, 002_indexes.sql)
│   │   │   ├── migrate.ts        # Automated migration runner
│   │   │   └── seed.ts           # Development & demo seed data (Admin, Employer, User, Jobs)
│   │   ├── utils/                # JWT tokens, argon2/bcrypt password hashing, metrics registry
│   │   ├── app.ts                # Express app configuration & middleware
│   │   └── server.ts             # Server entrypoint with graceful shutdown
│   ├── tests/
│   │   ├── unit/                 # Auth, validators, services unit tests
│   │   ├── integration/          # API endpoints, DB repo tests, Redis caching tests
│   │   └── health.test.ts        # Health & readiness probe validation
│   ├── Dockerfile                # Multi-stage build (build TS -> slim runtime, non-root user)
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── package.json
│
├── tests/
│   ├── e2e/                      # End-to-end integration test runner
│   └── load/
│       ├── k6-load-test.js       # k6 script simulating traffic spikes (2 -> 10 pods HPA target)
│       └── k6-smoke-test.js
│
├── docker/
│   ├── docker-compose.yml        # Local orchestration (frontend, backend, postgres, redis)
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
│
├── kubernetes/                   # Production-grade vanilla Kubernetes manifests
│   ├── namespace.yaml            # 'jobboard' namespace
│   ├── resourcequota.yaml        # CPU/Mem quotas for namespace isolation
│   ├── limitrange.yaml           # Default pod constraints
│   ├── serviceaccount.yaml       # Dedicated non-default SA
│   ├── rbac.yaml                 # Least-privilege Role & RoleBinding
│   ├── networkpolicy.yaml        # Strict Zero-Trust ingress/egress rules
│   ├── configmap.yaml            # Environment non-sensitive configs
│   ├── secret.yaml               # Template secret with base64 placeholders
│   ├── postgres.yaml             # StatefulSet with PV/PVC, Service, Readiness/Liveness
│   ├── redis.yaml                # Deployment, Service, Health probes
│   ├── backend-deployment.yaml   # 2 replicas, probes, securityContext (non-root), resource limits
│   ├── backend-service.yaml      # ClusterIP port 3001
│   ├── backend-hpa.yaml          # Autoscaling 2-10 replicas at 70% CPU
│   ├── backend-pdb.yaml          # PodDisruptionBudget (minAvailable: 1)
│   ├── frontend-deployment.yaml  # 2 replicas, Nginx Alpine, probes, non-root
│   ├── frontend-service.yaml     # ClusterIP port 3000
│   └── ingress.yaml              # AWS ALB Ingress configuration (SSL redirect, routing)
│
├── helm/
│   └── jobboard/                 # Modular production Helm Chart
│       ├── Chart.yaml
│       ├── values.yaml           # Base defaults
│       ├── values-dev.yaml       # Dev environment overrides
│       ├── values-staging.yaml   # Staging overrides
│       ├── values-production.yaml# Prod overrides (high replicas, strict resource requests)
│       └── templates/            # Dynamic templated manifests matching K8s specs
│
├── terraform/                    # Infrastructure as Code for AWS
│   ├── modules/
│   │   ├── vpc/                  # Multi-AZ VPC, public/private subnets, NAT Gateways
│   │   ├── security_groups/      # Ingress ALB, worker nodes, DB/Redis SGs
│   │   ├── ecr/                  # frontend and backend private repositories with encryption & lifecycle
│   │   ├── iam/                  # GitHub Actions OIDC provider, AssumeRoleWithWebIdentity, EKS roles
│   │   └── eks/                  # EKS Cluster v1.30, managed node groups, OIDC provider, addons
│   └── environments/
│       ├── dev/                  # main.tf, variables.tf, outputs.tf, terraform.tfvars
│       ├── staging/              # main.tf, variables.tf, outputs.tf, terraform.tfvars
│       └── production/           # main.tf, variables.tf, outputs.tf, terraform.tfvars
│
├── argocd/                       # GitOps specifications
│   ├── application.yaml          # ArgoCD Application manifest for Helm
│   ├── application-dev.yaml
│   ├── application-prod.yaml
│   ├── app-of-apps.yaml          # Root application pattern
│   └── rollout-canary.yaml       # Argo Rollouts progressive canary delivery (95/5 -> 75/25 -> 100)
│
├── monitoring/                   # Observability configs
│   ├── prometheus/
│   │   ├── prometheus.yml        # Scrape configs for backend /metrics
│   │   └── alert.rules.yml       # 5xx error rate > 5%, latency > 500ms, pod crash alerts
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   └── jobboard-overview.json # Real Grafana JSON dashboard with 11 production panels
│   │   └── provisioning/
│   │       ├── dashboards.yml
│   │       └── datasources.yml
│   ├── loki/
│   │   └── loki-config.yml       # Structured log ingestion
│   └── alertmanager/
│       └── alertmanager.yml      # Notification routing
│
├── scripts/                      # Automation & Testing scripts (Both Bash & PowerShell)
│   ├── validate.sh / validate.ps1
│   ├── test.sh / test.ps1
│   ├── build.sh / build.ps1
│   ├── docker-build.sh / docker-build.ps1
│   ├── health-check.sh / health-check.ps1
│   ├── backup-db.sh / backup-db.ps1
│   ├── restore-db.sh / restore-db.ps1
│   └── load-test.sh / load-test.ps1
│
├── docs/                         # Comprehensive production documentation
│   ├── architecture.md
│   ├── local-development.md
│   ├── docker.md
│   ├── kubernetes.md
│   ├── helm.md
│   ├── terraform.md
│   ├── aws.md
│   ├── github-actions.md
│   ├── argocd.md
│   ├── security.md
│   ├── monitoring.md
│   ├── logging.md
│   ├── autoscaling.md
│   ├── rollback.md
│   ├── disaster-recovery.md
│   ├── troubleshooting.md
│   ├── chaos-testing.md
│   └── load-testing.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint, unit tests, integration tests, build
│       ├── security.yml          # Gitleaks, Trivy vulnerability scan, CodeQL
│       ├── build.yml             # Docker build, Syft SBOM generation, ECR push
│       ├── deploy-dev.yml        # Dev GitOps trigger
│       ├── deploy-staging.yml    # Staging automated verification
│       └── deploy-production.yml # Manual gate approval & GitOps release update
│
├── docker-compose.yml
├── Makefile                      # Standardized make targets (install, test, lint, build, validate)
├── .env.example                  # Documented environment template with secure defaults
├── .gitignore                    # Comprehensive ignore file
├── README.md                     # Recruiter-friendly, high-impact master documentation
└── LICENSE                       # MIT License


## 10. Final Message

> *"From Git Push to Production — Automated, Secure, Observable, Scalable, and Recoverable."*

---

## 11. Author & License
Crafted with precision for production-grade DevSecOps demonstration. Licensed under the [MIT License](LICENSE).
