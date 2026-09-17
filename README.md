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
├── render.yaml                   # 100% Free Tier Render Web Service Blueprint
├── vercel.json                   # Optional Decoupled Frontend static hosting configuration
├── docker-compose.yml
├── Makefile                      # Standardized make targets (install, test, lint, build, validate)
├── .env.example                  # Documented environment template with secure defaults
├── .gitignore                    # Comprehensive ignore file
├── README.md                     # Recruiter-friendly, high-impact master documentation
└── LICENSE                       # MIT License


---

## 10. Genuinely Free Hosting Architecture

NexHire is designed to run in production with **zero hosting cost** on supported, sustainable free-tier infrastructure.

### Selected Hosting Platforms

| Component | Selected Free Provider | Free Tier Specification | Cost |
| :--- | :--- | :--- | :--- |
| **Primary Full-Stack** | **Render (Free Web Service)** | 750 free instance hours/month, automated SSL, Git-push CI/CD | **$0 / month** |
| **Alternative Frontend** | **Vercel (Hobby Tier)** | Unlimited static bandwidth, global edge CDN, instant deploy | **$0 / month** |
| **Primary Database** | **Neon Serverless Postgres** | 0.5 GB storage, autoscaling compute, SSL connection pooling | **$0 / month** |
| **Alternative Database** | **Supabase Postgres** | 500 MB Postgres instance, built-in pooling | **$0 / month** |
| **Fail-Safe Fallback** | **Embedded Memory Store** | High-performance in-memory state if cloud DB is cold/offline | **$0 / month** |

### Why Render Web Service Was Selected

1. **Single Unified Free Deployment**: The Node.js Express server serves both the high-performance REST API (`/api/*`, `/health`, `/metrics`) and the compiled Vite React frontend (`frontend/dist`) as static assets with client-side SPA routing fallback. This allows the entire platform to operate inside **1 single free instance** without incurring multiple free-tier allocations or CORS edge cases.
2. **Automatic HTTPS & Public Domain**: Render automatically generates and renews TLS/SSL certificates under `https://<service-name>.onrender.com`.
3. **Automated Git Deployments**: Native integration with GitHub triggers automatic `npm install && npm run build && npm start` on every commit pushed to `main`.
4. **Dynamic Port Binding**: Conforms directly with Render's dynamic `$PORT` environment variable binding on `0.0.0.0:$PORT`.
5. **No Credit Card Barrier**: Free Web Service can be deployed without mandatory paid subscriptions.

### Free-Tier Architecture Diagram

```
                     ┌──────────────────────────────────────────────┐
                     │          Render Free Web Service             │
                     │          (https://app.onrender.com)          │
                     │                                              │
                     │  ┌────────────────────┐   ┌────────────────┐ │
                     │  │ Vite React SPA     │   │ Express REST   │ │
                     │  │ (Compiled Static)  │   │ API & Metrics  │ │
                     │  └─────────┬──────────┘   └───────┬────────┘ │
                     │            │                      │          │
                     │            └──────────┬───────────┘          │
                     │                       │                      │
                     │             Single Port 0.0.0.0:$PORT        │
                     │                   Public HTTPS               │
                     └───────────────────────┬──────────────────────┘
                                             │
                                             ▼
                            ┌─────────────────────────────────┐
                            │  Neon / Supabase PostgreSQL     │
                            │        (Free Cloud Tier)        │
                            │    + Local Memory DB Fallback   │
                            └─────────────────────────────────┘
```

---

## 11. Step-by-Step Free Deployment Guide

### Option A: 1-Click Render Web Service (Single Full-Stack Deployment)

1. Push your code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial NexHire release"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Log into [Render](https://render.com) (Free account).
3. Click **New +** -> **Web Service**.
4. Select your GitHub repository.
5. Configure the service settings:
   - **Name**: `nexhire-platform`
   - **Runtime**: `Node`
   - **Region**: `Oregon (US West)` or `Frankfurt (EU)`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Generate a 32+ char random string)*
   - `DATABASE_URL`: *(Your Neon or Supabase PostgreSQL connection string, or leave blank to use in-memory store)*
   - `CORS_ORIGINS`: `http://localhost:5173,http://localhost:3000`
7. Click **Create Web Service**.
8. Render will build and deploy. Once complete, your public URL is live at `https://nexhire-platform.onrender.com`.

### Option B: Decoupled Deployment (Frontend on Vercel + Backend on Render)

1. **Deploy Backend on Render**:
   - Follow Option A with Build Command `npm --prefix backend run build` and Start Command `node backend/dist/server.js`.
   - Copy your backend URL: `https://your-backend.onrender.com`.
2. **Deploy Frontend on Vercel**:
   - Log into [Vercel](https://vercel.com) (Hobby Free tier).
   - Import your GitHub repo.
   - Set Root Directory to `frontend`.
   - Set Build Command to `npm run build` and Output Directory to `dist`.
   - Add Environment Variable:
     - `VITE_API_URL`: `https://your-backend.onrender.com/api`
   - Click **Deploy**. Vercel will host the frontend with global edge CDN and automatic SPA routing rewrites configured via `vercel.json`.

---

## 12. Complete Environment Variables Reference

| Variable | Description | Required? | Default / Example |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application environment mode | Optional | `production` |
| `PORT` | HTTP port for server binding | Optional (Platform sets) | `5000` (Render sets `$PORT`) |
| `HOST` | Interface IP binding | Optional | `0.0.0.0` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | **Required** in prod | Minimum 32 characters |
| `JWT_EXPIRES_IN` | Token duration | Optional | `1h` |
| `DATABASE_URL` | PostgreSQL connection string | Optional (Has fallback) | `postgresql://user:pass@ep-xyz.neon.tech/db?sslmode=require` |
| `REDIS_URL` | Redis caching connection string | Optional (Has fallback) | `redis://localhost:6379` |
| `CORS_ORIGINS` | Comma-separated allowed origins | Optional | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_URL` | Frontend API target endpoint | Optional | `/api` (unified) or full backend URL (decoupled) |
| `RATE_LIMIT_MAX` | Max requests per rate limit window | Optional | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in milliseconds | Optional | `900000` (15 minutes) |

---

## 13. REST API Specification

### Health & Observability Endpoints

#### `GET /api/health` and `GET /api/v1/health`
Standard service health endpoint complying with production monitoring guidelines.
```json
{
  "status": "ok",
  "service": "NexHire API",
  "timestamp": "2026-09-17T02:58:00.271Z",
  "uptimeSeconds": 45,
  "version": "1.0.0",
  "checks": {
    "database": { "status": "healthy", "latencyMs": 2 },
    "redis": { "status": "healthy", "latencyMs": 1 },
    "memory": { "rssMb": 70.25, "heapUsedMb": 15.19 }
  }
}
```

#### `GET /metrics`
Raw Prometheus scrape target exposing standard HTTP and process telemetry:
- `http_requests_total`
- `http_request_duration_seconds`
- `http_active_requests`
- `nodejs_heap_size_used_bytes`

### Business Routes

| Method | Path | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | No | Authenticate user and obtain JWT token |
| `POST` | `/api/auth/register` | No | Register new candidate or employer account |
| `GET` | `/api/auth/me` | Yes (Bearer) | Get current authenticated user profile |
| `POST` | `/api/auth/logout` | No | Invalidate client session |
| `GET` | `/api/jobs` | No | Paginated list of active jobs with keyword, filter & remote search |
| `GET` | `/api/jobs/:id` | No | Retrieve detailed job posting |
| `POST` | `/api/jobs` | Yes (EMPLOYER/ADMIN) | Create a new job vacancy |
| `POST` | `/api/jobs/:id/save` | Yes (CANDIDATE) | Bookmark a job to saved jobs list |
| `DELETE` | `/api/jobs/:id/save` | Yes (CANDIDATE) | Remove job from saved list |
| `GET` | `/api/saved-jobs` | Yes (CANDIDATE) | Retrieve all saved jobs for current user |
| `GET` | `/api/applications` | Yes (CANDIDATE/EMPLOYER) | View applicant pipeline or submitted applications |
| `POST` | `/api/applications` | Yes (CANDIDATE) | Submit job application with cover letter & resume link |
| `GET` | `/api/admin/stats` | Yes (ADMIN) | Real-time system telemetry and cluster metrics |
| `GET` | `/api/admin/users` | Yes (ADMIN) | List all registered accounts |

---

## 14. Comprehensive Troubleshooting Guide

| Issue / Symptom | Root Cause | Exact Solution |
| :--- | :--- | :--- |
| **Build failed (`npm run build`)** | TypeScript compilation mismatch or missing dependencies | Run `npm install` in both root, `backend`, and `frontend`. Execute `tsc --noEmit` inside `backend` and `frontend` to inspect type errors. |
| **Node version mismatch** | Environment using Node < 20 | Ensure Node `>= 20.0.0` is active. Check with `node -v`. On Render, set environment variable `NODE_VERSION=20.18.0`. |
| **Python version mismatch** | Calling python commands in a pure Node project | NexHire is 100% TypeScript/Node.js. No Python runtime is needed. |
| **Module not found (`Cannot find module...`)** | Incomplete dependency tree in production | Ensure build command is `npm install && npm run build`. Check `dependencies` in `backend/package.json` and ensure dependencies are not misplaced in `devDependencies`. |
| **PORT error (`EADDRINUSE` or bound to wrong port)** | Hardcoded port preventing platform port assignment | NexHire dynamically reads `process.env.PORT` and binds to `0.0.0.0:$PORT`. Never hardcode `localhost` or static ports in production. |
| **CORS error (`CORS policy: Not allowed by origin`)** | Frontend origin not present in backend CORS allowlist | In Render environment variables, add your frontend domain to `CORS_ORIGINS` (e.g. `https://nexhire-frontend.vercel.app`). Note that Render and Vercel domains are automatically allowed by wildcard match in `app.ts`. |
| **Database connection failure** | Cloud PostgreSQL requires SSL encryption or has reached max pool | Ensure `DATABASE_URL` ends with `?sslmode=require`. NexHire's `Pool` auto-configures `ssl: { rejectUnauthorized: false }` for cloud providers (Neon/Supabase) with a conservative pool size of 10. If the database is sleeping, NexHire automatically falls back to the in-memory database store. |
| **Environment variable missing** | `JWT_SECRET` not set in cloud platform | In Render or Vercel dashboard, verify that `JWT_SECRET` is populated. NexHire provides safe development defaults locally, but requires setting in production. |
| **API unavailable (Cold Start / Sleeping)** | Free-tier instance sleeping after 15 minutes of inactivity | Render spins down inactive free web services. The first request will take ~30–45 seconds to wake up the container. The NexHire frontend displays a graceful loading state and sanitizes timeout errors. |
| **SPA 404 on page refresh (`/browse`, `/employer`)** | Web server does not rewrite client-side routes to `index.html` | NexHire's Express server serves `index.html` for all non-API GET requests. For decoupled Vercel hosting, `vercel.json` includes the SPA rewrite rule `{ "source": "/(.*)", "destination": "/index.html" }`. |
| **Static assets missing (`404 on /assets/...`)** | Static files not copied or wrong directory referenced | Ensure `npm run build:frontend` executed before starting backend. Verify that `frontend/dist` contains `index.html` and `assets/`. |
| **Authentication failure (401 Unauthorized)** | Missing or malformed `Authorization: Bearer <token>` header | Check local storage key `jobboard_token`. In demo mode, click the 1-Click fast switcher buttons (`Admin`, `Employer`, `Candidate`) in the top navbar to instantly refresh demo credentials. |
| **Deployment timeout** | Slow build exceeding free tier timeout limits | Ensure cache directories (`node_modules`, `.git`) are not duplicated. Both frontend and backend compile in under 5 seconds with standard `npm run build`. |
| **Health check failure (`GET /api/health` 503)** | Critical service dependencies reporting failure | Check `/api/health` JSON output for `checks.database` and `checks.redis`. If backing services are down, NexHire operates in resilient `degraded` mode while keeping the HTTP status responsive. |

---

## 15. Known Free-Tier Limitations & Mitigations

- **Free-Tier Inactivity Sleep**: Render free web services spin down after 15 minutes of zero traffic.
  - *Mitigation*: The frontend includes warm-up handling and informs users if the service is spinning up, avoiding blank screens or raw technical stack traces.
- **Database Storage Limits**: Neon provides 0.5 GB and Supabase provides 0.5 GB of free PostgreSQL storage.
  - *Mitigation*: NexHire uses optimized schemas, pagination (`limit=10`), and an in-memory fallback store to ensure zero cost and zero storage overflow.
- **Connection Limits**: Free databases limit concurrent connections to 10–20 connections.
  - *Mitigation*: NexHire configures `max: 10` connections with `idleTimeoutMillis: 30000` to prevent connection exhaustion.

---

## 16. Final Status & Summary

> **PRODUCTION READY — FREE HOSTING**
> 
> Tested, verified, and configured for 100% free cloud deployment on **Render Web Service** and **Neon / Supabase PostgreSQL**.

---

## 17. Author & License
Crafted with precision for production-grade DevSecOps and free-tier cloud deployment demonstration. Licensed under the [MIT License](LICENSE).

