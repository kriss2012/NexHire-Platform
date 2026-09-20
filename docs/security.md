
# ◈ JOBBOARD DEVSECOPS PLATFORM
## 3D Cloud Security & DevSecOps Architecture

> **Security is not a feature added at the end.**
> It is engineered as a first-class requirement across every layer of the platform.

```text
                         ╔══════════════════════════════╗
                      ╔══╝   ☁️  CLOUD SECURITY  ╚══╗
                   ╔══╝                              ╚══╗
                ╔══╝       🔐 ZERO-TRUST CORE          ╚══╗
             ╔══╝                                        ╚══╗
          ╔══╝        ☸️ KUBERNETES RUNTIME              ╚══╗
       ╔══╝                                                ╚══╗
    ╔══╝              🐳 CONTAINER SECURITY                  ╚══╗
 ╔══╝                                                        ╚══╗
║                 🛡️ APPLICATION SECURITY                       ║
╚════════════════════════════════════════════════════════════════╝

        CODE → DEPENDENCIES → CONTAINERS → K8s → CLOUD
                           ↓
                    CONTINUOUS SECURITY


---

🛡️ 01 — PRODUCTION SECURITY MATRIX

╭──────────────────────────────────────────────────────────────╮
│                    🔐 SECURITY STATUS                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   🔑 SECRETS              ████████████████████  PROTECTED    │
│   🧬 DEPENDENCIES         ████████████████████  SCANNED      │
│   🐳 CONTAINERS           ████████████████████  HARDENED     │
│   ☸️ KUBERNETES            ████████████████████  ISOLATED     │
│   🌐 NETWORK              ████████████████████  ZERO-TRUST   │
│   ☁️ AWS                   ████████████████████  FEDERATED    │
│   🗄️ DATABASE              ████████████████████  PRIVATE     │
│   📋 LOGGING              ████████████████████  REDACTED     │
│                                                              │
╰──────────────────────────────────────────────────────────────╯

Status	Security Control	Implementation

🟢	🔑 Zero Secrets in Git	.gitignore, .env.example, pre-commit hooks
🟢	🕵️ Automated Secret Scanning	Gitleaks on every PR & push
🟢	🔍 Vulnerability Scanning	Trivy filesystem + container image scanning
🟢	📦 SBOM Generation	Syft → SPDX JSON artifacts
🟢	👤 Non-Root Containers	Backend UID 10001, Frontend UID 101
🟢	☸️ Least-Privilege RBAC	Read-only ConfigMap access; no cluster-admin
🟢	🚫 Zero-Trust NetworkPolicies	Default deny-all
🟢	📊 Resource Controls	CPU/RAM requests and limits
🟢	🔐 Password Security	bcryptjs, 12 salt rounds
🟢	🎫 JWT Authentication	Short-lived JWT + HMAC-SHA256
🟢	💉 SQL Injection Protection	100% parameterized queries
🟢	🪖 HTTP Hardening	Helmet + Nginx security headers
🟢	🚦 Rate Limiting	/api 100/15m · /auth 20/15m
🪪	AWS Identity	GitHub Actions → AWS OIDC
🏷️	Immutable Images	Git SHA image tags
🗄️	Private Database	PostgreSQL inside private subnets
🧹	Log Redaction	Winston removes sensitive values



---

🧬 02 — SECURITY DEFENSE LAYERS

┌───────────────────────┐
                         │       ☁️ AWS CLOUD     │
                         │   IAM • VPC • WAF     │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │    ☸️ KUBERNETES       │
                         │ RBAC • NetworkPolicy  │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │      🐳 CONTAINERS      │
                         │ Trivy • Non-Root • SBOM│
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │      🛡️ APPLICATION     │
                         │ JWT • bcrypt • Helmet  │
                         └───────────┬───────────┘
                                     │
                         ┌───────────▼───────────┐
                         │        💻 CODE         │
                         │ Gitleaks • Hooks • CI  │
                         └───────────────────────┘

                     DEFENSE-IN-DEPTH ARCHITECTURE


---

🔐 03 — ZERO-TRUST SECURITY MODEL

┌──────────────────────────┐
                 │       🌐 INTERNET         │
                 └────────────┬─────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ 🛡️ EDGE SECURITY  │
                    │ Helmet / Nginx    │
                    │ Rate Limiting     │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ ☸️ K8s INGRESS    │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
        ┌─────────────────┐       ┌─────────────────┐
        │ 🖥️ FRONTEND     │       │ ⚙️ BACKEND      │
        │ UID: 101        │       │ UID: 10001      │
        │ Nginx           │       │ Node.js         │
        └────────┬────────┘       └────────┬────────┘
                 │                         │
                 │                  ┌──────┴──────┐
                 │                  ▼             ▼
                 │          ┌─────────────┐ ┌─────────────┐
                 │          │ 🗄️ POSTGRES │ │ 🔴 REDIS   │
                 │          │ PRIVATE     │ │ PRIVATE     │
                 │          └─────────────┘ └─────────────┘
                 │
                 └─────── 🚫 NO DIRECT INTERNET ACCESS ───────┘

Network Security Principle

DEFAULT
   │
   ▼
🚫 DENY ALL
   │
   ├──────► Frontend → Backend       ✅ ALLOWED
   │
   ├──────► Backend → PostgreSQL     ✅ ALLOWED
   │
   ├──────► Backend → Redis          ✅ ALLOWED
   │
   ├──────► Internet → PostgreSQL   ❌ BLOCKED
   │
   └──────► Internet → Redis        ❌ BLOCKED


---

🐳 04 — CONTAINER HARDENING

🐳 SECURE CONTAINER
              ╭────────────────────────╮
           ╭──┤                        ├──╮
        ╭──┤  │   🔒 NON-ROOT USER     │  ├──╮
       │  │  │   UID: 10001 / 101     │  │  │
       │  │  │                        │  │  │
       │  │  │   🔍 TRIVY SCANNED     │  │  │
       │  │  │                        │  │  │
       │  │  │   📦 SBOM GENERATED    │  │  │
       │  │  │                        │  │  │
       │  │  │   🏷️ SHA TAGGED        │  │  │
       │  │  │                        │  │  │
       ╰──┤  ╰────────────────────────╯  ├──╯
          ╰───────────────────────────────╯

                 🚫 NO :latest IN PROD

Immutable Image Strategy

SOURCE CODE
     │
     ▼
┌──────────────┐
│   BUILD CI   │
└──────┬───────┘
       │
       ├──────► 🔍 Trivy Scan
       │
       ├──────► 📦 Syft SBOM
       │
       ├──────► 🔐 Gitleaks
       │
       ▼
┌────────────────────┐
│ Docker Image       │
│ SHA: abc123...     │
└─────────┬──────────┘
          │
          ▼
     ☸️ DEPLOYMENT


---

📦 05 — SOFTWARE SUPPLY CHAIN SECURITY

Every production container passes through the following security pipeline:

👨‍💻 DEVELOPER
             │
             ▼
        📂 SOURCE CODE
             │
             ▼
       ┌───────────────┐
       │ 🔑 GITLEAKS   │
       │ Secret Scan   │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ 🔍 TRIVY      │
       │ CVE Scanning  │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ 📦 SYFT       │
       │ SBOM Creation │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ 🐳 IMAGE      │
       │ SHA IMMUTABLE │
       └───────┬───────┘
               │
               ▼
          ☸️ PRODUCTION


---

📋 06 — SBOM GENERATION

Every container image receives a machine-readable Software Bill of Materials.

Local Generation

# Generate SPDX JSON SBOM
syft jobboard-backend:latest \
  -o spdx-json \
  > backend-sbom.spdx.json

# Display dependency summary
syft jobboard-backend:latest \
  -o table

SBOM Flow

🐳 CONTAINER
     │
     ▼
   SYFT
     │
     ▼
📦 SOFTWARE INVENTORY
     │
     ├── Libraries
     ├── Packages
     ├── Versions
     ├── Dependencies
     └── Components
     │
     ▼
📄 SPDX JSON
     │
     ▼
☁️ CI ARTIFACT


---

🔑 07 — SECRET MANAGEMENT ARCHITECTURE

🔐 SECRET LIFECYCLE

 ┌──────────────────┐
 │ 💻 LOCAL         │
 │ Development      │
 │                  │
 │ .env             │
 │ .env.example     │
 └────────┬─────────┘
          │
          │ NEVER COMMIT
          ▼
 ┌──────────────────┐
 │ 🚀 CI/CD         │
 │ GitHub Actions   │
 │                  │
 │ GitHub Secrets   │
 └────────┬─────────┘
          │
          │ OIDC
          ▼
 ┌──────────────────┐
 │ ☁️ AWS IAM       │
 │                  │
 │ Temporary        │
 │ Credentials      │
 └────────┬─────────┘
          │
          ▼
 ┌──────────────────────────┐
 │ ☸️ KUBERNETES            │
 │                          │
 │ Encrypted Secrets        │
 │          +               │
 │ AWS Secrets Manager      │
 │          ↓               │
 │ External Secrets (ESO)   │
 └──────────────────────────┘

Secret Security Rules

🔴 NEVER
   ├── Commit .env files
   ├── Hard-code credentials
   ├── Store AWS access keys in CI
   ├── Print secrets into logs
   └── Use credentials inside source code

🟢 ALWAYS
   ├── Use environment variables
   ├── Use GitHub Secrets
   ├── Use AWS OIDC
   ├── Encrypt Kubernetes Secrets
   └── Rotate sensitive credentials


---

☁️ 08 — AWS OIDC TRUST MODEL

┌───────────────────────┐
│       GitHub Actions  │
│                       │
│    🚀 CI/CD Pipeline  │
└───────────┬───────────┘
            │
            │ 🔐 OIDC TOKEN
            ▼
┌───────────────────────┐
│        AWS IAM        │
│                       │
│   AssumeRoleWith      │
│   WebIdentity         │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   ☁️ AWS RESOURCES    │
│                       │
│ ECR • EKS • S3 • etc. │
└───────────────────────┘

          🚫 NO PERMANENT AWS ACCESS KEYS


---

🗄️ 09 — DATABASE SECURITY

☁️ AWS VPC
                            │
                ┌───────────┴───────────┐
                │                       │
          🌐 PUBLIC SUBNET        🔒 PRIVATE SUBNET
                │                       │
          Load Balancer             PostgreSQL
                │                       │
                ▼                       │
           Backend API ────────────────┘
                │
                └──────────► Redis

                 🚫 INTERNET
                     │
                     ├──────X──────► PostgreSQL
                     │
                     └──────X──────► Redis

PostgreSQL is isolated inside private networking and is not directly exposed to the public Internet.


---

🔐 10 — APPLICATION SECURITY STACK

╭────────────────────────────────────────────╮
│            🛡️ APPLICATION SHIELD            │
├────────────────────────────────────────────┤
│                                            │
│  🔐 bcryptjs                               │
│       └── 12 Salt Rounds                   │
│                                            │
│  🎫 JWT                                    │
│       └── Short-Lived Tokens               │
│       └── HMAC-SHA256 Verification         │
│                                            │
│  💉 SQL Protection                         │
│       └── Parameterized Queries             │
│       └── $1 / $2 placeholders             │
│                                            │
│  🪖 Helmet                                 │
│       └── HTTP Security Headers            │
│                                            │
│  🚦 Rate Limiting                          │
│       ├── /api  → 100 req / 15 min         │
│       └── /auth → 20 req / 15 min          │
│                                            │
│  🧹 Winston                                │
│       └── Sensitive Log Redaction          │
│                                            │
╰────────────────────────────────────────────╯


---

🧠 11 — COMPLETE SECURITY PIPELINE

🧑‍💻
                              │
                              ▼
                     ┌─────────────────┐
                     │    SOURCE CODE  │
                     └────────┬────────┘
                              │
                     🔑 GITLEAKS
                              │
                              ▼
                     ┌─────────────────┐
                     │   CI SECURITY   │
                     └────────┬────────┘
                              │
                    🔍 TRIVY + 📦 SYFT
                              │
                              ▼
                     ┌─────────────────┐
                     │ 🐳 CONTAINER    │
                     │   HARDENING     │
                     └────────┬────────┘
                              │
                       🏷️ SHA TAG
                              │
                              ▼
                     ┌─────────────────┐
                     │ ☸️ KUBERNETES   │
                     │ RBAC + Network  │
                     │ Policies        │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ ☁️ AWS CLOUD    │
                     │ IAM + VPC       │
                     └────────┬────────┘
                              │
                              ▼
                     🔒 PRODUCTION


---

🏆 SECURITY PRINCIPLES

╔══════════════════════════════════════════════════════════╗
║                  🛡️ SECURITY BY DESIGN                   ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  01  🔐  ZERO TRUST                                     ║
║      Never trust. Always verify.                        ║
║                                                          ║
║  02  👤  LEAST PRIVILEGE                                ║
║      Give every component only what it needs.           ║
║                                                          ║
║  03  🧱  DEFENSE IN DEPTH                               ║
║      Multiple independent security layers.               ║
║                                                          ║
║  04  📦  SUPPLY CHAIN VISIBILITY                         ║
║      Know what software enters production.              ║
║                                                          ║
║  05  🔑  SECRET ISOLATION                                ║
║      Credentials stay outside source code.               ║
║                                                          ║
║  06  🐳  RUNTIME HARDENING                               ║
║      Non-root containers and restricted workloads.       ║
║                                                          ║
║  07  ☁️  CLOUD IDENTITY                                  ║
║      Temporary credentials through OIDC.                 ║
║                                                          ║
║  08  📊  CONTINUOUS VERIFICATION                         ║
║      Security checks execute throughout CI/CD.           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝


---

🚀 JOBBOARD DEVSECOPS SECURITY STACK

┌──────────────────────────────────────────┐
       │              ☁️ AWS CLOUD                │
       │        IAM • VPC • Private Subnets       │
       └────────────────────┬─────────────────────┘
                            │
       ┌────────────────────▼─────────────────────┐
       │             ☸️ KUBERNETES                │
       │     RBAC • NetworkPolicy • Limits        │
       └────────────────────┬─────────────────────┘
                            │
       ┌────────────────────▼─────────────────────┐
       │              🐳 DOCKER                   │
       │      Non-Root • SHA Tags • Trivy         │
       └────────────────────┬─────────────────────┘
                            │
       ┌────────────────────▼─────────────────────┐
       │            🛡️ APPLICATION                │
       │ JWT • bcrypt • Helmet • Rate Limiting    │
       └────────────────────┬─────────────────────┘
                            │
       ┌────────────────────▼─────────────────────┐
       │             📦 SUPPLY CHAIN              │
       │       Gitleaks • Syft • SBOM             │
       └────────────────────┬─────────────────────┘
                            │
       ┌────────────────────▼─────────────────────┐
       │             💻 SOURCE CODE               │
       │       Secure Development Practices       │
       └──────────────────────────────────────────┘


                  🔐 SECURE BY DESIGN
                       2026

> JobBoard DevSecOps Platform

Secure Code → Secure Build → Secure Container → Secure Runtime → Secure Cloud

Defense in Depth • Zero Trust • Least Privilege • Continuous Security
