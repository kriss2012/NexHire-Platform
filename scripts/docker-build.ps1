$ErrorActionPreference = "Stop"

$gitSha = try { (git rev-parse --short HEAD).Trim() } catch { "local" }
Write-Host "==> Building Docker Images with Git SHA tag: $gitSha..." -ForegroundColor Cyan

Write-Host "--> Building Backend..." -ForegroundColor Yellow
docker build -t "jobboard-backend:$gitSha" -t "jobboard-backend:latest" -f backend/Dockerfile backend

Write-Host "--> Building Frontend..." -ForegroundColor Yellow
docker build -t "jobboard-frontend:$gitSha" -t "jobboard-frontend:latest" -f frontend/Dockerfile frontend

Write-Host "==> Docker Images Built Successfully!" -ForegroundColor Green
Write-Host "    jobboard-backend:$gitSha" -ForegroundColor Green
Write-Host "    jobboard-frontend:$gitSha" -ForegroundColor Green
