$ErrorActionPreference = "Stop"

Write-Host "==> Running Backend Tests..." -ForegroundColor Cyan
Push-Location backend
npm.cmd test
Pop-Location

Write-Host "==> Running Frontend Tests..." -ForegroundColor Cyan
Push-Location frontend
npm.cmd test
Pop-Location

Write-Host "==> All Tests Passed!" -ForegroundColor Green
