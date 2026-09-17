# Docker & Container Architecture Documentation

## 1. Multi-Stage Container Design

Both the frontend and backend Dockerfiles use multi-stage builds to optimize security and minimize image footprint:

### Backend Dockerfile (`backend/Dockerfile`)
- **Stage 1 (Builder)**: `node:22-alpine`, installs dependencies (`npm ci`), runs TypeScript compiler (`npm run build`), and prunes development dependencies.
- **Stage 2 (Runner)**: `node:22-alpine`, adds `dumb-init` (PID 1 signal forwarding for graceful shutdown), creates an unprivileged user (`nodejs:10001`), copies only production `node_modules` and compiled `dist/`.
- **User**: Runs strictly as `nodejs` (UID `10001`), NEVER root.
- **Healthcheck**: `curl -f http://localhost:3001/live || exit 1`.

### Frontend Dockerfile (`frontend/Dockerfile`)
- **Stage 1 (Builder)**: `node:22-alpine`, builds Vite React static assets into `/app/dist`.
- **Stage 2 (Runner)**: `nginxinc/nginx-unprivileged:alpine-slim`, copies `/app/dist` to `/usr/share/nginx/html`, injects security-hardened `nginx.conf` listening on unprivileged port 3000.
- **Security Headers**: HSTS, CSP, X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).
- **Healthcheck**: `wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1`.

---

## 2. Docker Compose Local Orchestration

The platform provides a complete `docker-compose.yml` orchestrating all four services:
- `frontend` (Port 3000)
- `backend` (Port 3001)
- `postgres` (Port 5432, healthcheck `pg_isready`)
- `redis` (Port 6379, healthcheck `redis-cli ping`)

### Starting the Full Stack
```bash
# Build images and start all containers in detached mode
docker compose up -d --build

# Verify all containers are running and healthy
docker compose ps
```

Expected output:
```
NAME                 IMAGE                     STATUS                    PORTS
jobboard-backend     jobboard-devops-backend    Up (healthy)              0.0.0.0:3001->3001/tcp
jobboard-frontend    jobboard-devops-frontend   Up (healthy)              0.0.0.0:3000->3000/tcp
jobboard-postgres    postgres:16-alpine        Up (healthy)              0.0.0.0:5432->5432/tcp
jobboard-redis       redis:7-alpine            Up (healthy)              0.0.0.0:6379->6379/tcp
```

### Inspecting Container Logs
```bash
# Follow logs for backend
docker compose logs -f backend

# Follow logs for postgres
docker compose logs -f postgres
```

### Stopping and Teardown
```bash
# Stop containers while preserving data volumes
docker compose down

# Stop containers and wipe data volumes (Clean slate)
docker compose down -v
```

---

## 3. Image Vulnerability Scanning with Trivy

Before pushing to any registry, containers must be scanned:
```bash
# Build tagged image with Git SHA
GIT_SHA=$(git rev-parse --short HEAD)
docker build -t jobboard-backend:$GIT_SHA -f backend/Dockerfile backend

# Run Trivy container scan
trivy image --severity CRITICAL,HIGH jobboard-backend:$GIT_SHA
```
Exit code will be `0` if no unpatched critical vulnerabilities exist.
