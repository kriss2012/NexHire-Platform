# GitHub Actions CI/CD Pipeline Documentation

The project implements a decoupled, event-driven CI/CD architecture across 6 focused workflows in `.github/workflows/`.

---

## 1. Workflow Architecture & Responsibilities

| Workflow | File | Trigger | Key Jobs & Actions |
|---|---|---|---|
| **CI Pipeline** | `ci.yml` | `push`, `pull_request` | Node 22 setup, dependency caching, linting, unit & integration tests, Jest coverage report upload |
| **Security Pipeline** | `security.yml` | `push`, `pull_request`, Weekly | Gitleaks secret detection, Trivy filesystem vulnerability scan, Kubeconform schema validation |
| **Build & DevSecOps** | `build.yml` | `push` (main, develop) | Multi-stage Docker build, Trivy container scan, Syft SBOM (`spdx-json`) generation & upload, AWS OIDC auth, ECR push |
| **Deploy Dev** | `deploy-dev.yml` | `build.yml` on `develop` | Updates `values-dev.yaml` with Git SHA, triggers ArgoCD auto-sync |
| **Deploy Staging** | `deploy-staging.yml` | `build.yml` on `main` | Updates staging values, runs automated health & probe smoke tests |
| **Deploy Production** | `deploy-production.yml` | `workflow_dispatch` | Manual environment approval gate, promotes release Git SHA tag to Production Helm chart |

---

## 2. DevSecOps Quality Gates (Failure Rules)

The CI/CD pipeline strictly adheres to the following rules:
- **No `continue-on-error: true`**: Real test or build failures are never masked.
- **Fail on Critical CVEs**: Trivy will exit with code `1` if unpatched `CRITICAL` or `HIGH` severity vulnerabilities are present.
- **Secret Protection**: Gitleaks enforces a zero-secrets commit policy.
- **Strict Linting**: TypeScript strict mode (`tsc --noEmit`) must pass with zero compiler warnings or errors.

---

## 3. Required GitHub Secrets & Variables

Configure these settings under **Repository Settings -> Secrets and variables -> Actions**:

| Secret / Variable | Type | Description |
|---|---|---|
| `AWS_OIDC_ROLE_ARN` | Secret | ARN of IAM Role assumed by GitHub Actions via OIDC |
| `AWS_REGION` | Variable | AWS Region (e.g. `us-east-1`) |
| `PRODUCTION_REVIEWERS` | Environment | Designated approvers for `production` environment |

---

## 4. Local Simulation of CI Pipeline

Developers can validate the complete CI pipeline locally before pushing code:
```bash
# Run root validation script
powershell ./scripts/validate.ps1
# or on Linux/macOS:
./scripts/validate.sh
```
