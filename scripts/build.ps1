$ErrorActionPreference = "Stop"

Write-Host "==> Building Backend TypeScript..." -ForegroundColor Cyan
Push-Location backend
npm.cmd run build
Pop-Location

Write-Host "==> Building Frontend Vite Bundle..." -ForegroundColor Cyan
Push-Location frontend
npm.cmd run build
Pop-Location

Write-Host "==> Production Builds Completed!" -ForegroundColor Green
