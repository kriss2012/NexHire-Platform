# DevSecOps & Cloud Security Architecture

Security is treated as a first-class requirement across every layer of the JobBoard platform: application code, dependencies, containers, Kubernetes runtime, and cloud infrastructure.

---

## 1. Production Security Checklist

| Check | Requirement | Implementation Status |
|---|---|---|
| `[x]` | **Zero Secrets in Git** | Enforced via `.gitignore`, `.env.example`, and pre-commit hooks |
| `[x]` | **Automated Secret Scanning** | Gitleaks scanning in CI workflow on every PR & push |
| `[x]` | **Vulnerability Scanning** | Trivy scanning filesystem dependencies and container images |
| `[x]` | **Software Bill of Materials** | Syft generating `spdx-json` SBOM attached to CI artifacts |
| `[x]` | **Non-Root Containers** | Backend UID `10001` (`nodejs`), Frontend UID `101` (`nginx`) |
| `[x]` | **Least-Privilege Kubernetes RBAC** | ServiceAccount with read-only ConfigMap access; no cluster-admin |
| `[x]` | **Zero-Trust NetworkPolicies** | Default deny-all; Postgres and Redis blocked from external internet |
| `[x]` | **Resource Quotas & Limits** | CPU and RAM requests/limits defined on every container workload |
| `[x]` | **Password Security** | Passwords hashed with `bcryptjs` (salt rounds: 12) |
| `[x]` | **Stateless Auth (JWT)** | Short-lived JWTs with strong HMAC-SHA256 signature verification |
| `[x]` | **SQL Injection Protection** | 100% parameterized SQL queries (`$1`, `$2`) |
| `[x]` | **HTTP Hardening** | Helmet middleware + Nginx security headers (`CSP`, `HSTS`, `nosniff`) |
| `[x]` | **Rate Limiting** | Express rate limiting on `/api` (100 req/15m) and `/auth` (20 req/15m) |
| `[x]` | **No Permanent AWS Keys** | GitHub Actions authenticating to AWS via OpenID Connect (OIDC) |
| `[x]` | **Immutable Image Tags** | Docker images tagged with Git SHA; no `:latest` in production |
| `[x]` | **Database Not Public** | PostgreSQL placed in private subnets, inaccessible from Internet |
| `[x]` | **Sensitive Log Redaction** | Winston logger automatically redacts passwords, tokens, and secrets |

---

## 2. Supply Chain Security (SBOM)

Every container image built by GitHub Actions undergoes automated SBOM (Software Bill of Materials) generation using Anchore Syft.

### Local SBOM Generation
```bash
# Generate SBOM for Backend Container in SPDX JSON format
syft jobboard-backend:latest -o spdx-json > backend-sbom.spdx.json

# View high-level dependency package summary
syft jobboard-backend:latest -o table
```

---

## 3. Secret Management Strategy
1. **Local Development**: `.env` (derived from safe template `.env.example`).
2. **CI/CD Pipeline**: GitHub Secrets (`AWS_OIDC_ROLE_ARN`).
3. **Cloud Infrastructure**: AWS IAM OIDC federation (zero stored secrets).
4. **Kubernetes Workloads**: Encrypted Kubernetes Secrets, with optional integration for AWS Secrets Manager via External Secrets Operator (ESO).
