# Local Development Guide

This guide describes how to run and test the complete JobBoard platform on a local workstation.

---

## Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x or v11.x
- **Docker & Docker Compose**: v2.20+ (optional for bare-metal Node execution)
- **Git**: v2.40+

---

## 1. Quickstart (Bare-Metal Node.js)

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/example-org/jobboard-devops.git
cd jobboard-devops
cp .env.example .env
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Run Seed and Start Backend API
```bash
# In Terminal 1: Run migrations & seed data
cd backend
npm run seed

# Start backend in development mode (port 3001)
npm run dev
```

The backend starts listening on `http://localhost:3001`. You can verify:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/jobs
```

### Step 4: Start Frontend Client
```bash
# In Terminal 2: Start Vite dev server (port 3000)
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 2. Seed Demo Credentials
The database seed script initializes three accounts for instant testing:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **ADMIN** | `admin@jobboard.io` | `Admin123!` | System stats, all user management, all jobs |
| **EMPLOYER** | `recruiter@techcorp.io` | `Employer123!` | Post jobs, edit jobs, review applications |
| **USER** | `alex.dev@cloud.io` | `Applicant123!` | Search, bookmark jobs, submit applications |

The frontend UI includes a **"DEMO:"** toolbar on the top navigation bar for 1-click authentication into any of these roles!

---

## 3. Running Automated Tests Locally

```bash
# Run backend test suite (Unit, Integration, Probes)
cd backend
npm test

# Generate test coverage report
npm run test:coverage

# Lint and typecheck backend
npm run lint

# Build frontend production bundle
cd ../frontend
npm run build
```

---

## 4. Troubleshooting Local Development
- **Port 3001 in use**: Change `PORT=3002` in `.env` or terminate the offending process.
- **Cache behavior**: In local mode without Redis running, the system automatically uses its high-performance in-memory cache and records hits/misses cleanly.
