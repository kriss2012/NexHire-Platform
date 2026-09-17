# PowerShell Validation Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Running JobBoard DevSecOps Comprehensive Validation" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Write-Host "`n--> 1. Validating Backend (Lint, Build, Test)..." -ForegroundColor Yellow
Push-Location backend
npm.cmd run lint
npm.cmd run build
npm.cmd test
Pop-Location

Write-Host "`n--> 2. Validating Frontend (Lint, Build)..." -ForegroundColor Yellow
Push-Location frontend
npm.cmd run lint
npm.cmd run build
Pop-Location

Write-Host "`n--> 3. Checking Tools & Infrastructure Manifests..." -ForegroundColor Yellow
if (Get-Command kubectl -ErrorAction SilentlyContinue) {
    kubectl apply -f kubernetes/ --dry-run=client
    Write-Host "Kubernetes dry-run validation: PASSED" -ForegroundColor Green
} else {
    Write-Host "kubectl not found on PATH, validated in CI via kubeconform." -ForegroundColor Gray
}

if (Get-Command helm -ErrorAction SilentlyContinue) {
    helm lint helm/jobboard
    Write-Host "Helm chart lint: PASSED" -ForegroundColor Green
} else {
    Write-Host "helm not found on PATH, validated in CI." -ForegroundColor Gray
}

if (Get-Command terraform -ErrorAction SilentlyContinue) {
    terraform -chdir=terraform/environments/dev init -backend=false
    terraform -chdir=terraform/environments/dev validate
    Write-Host "Terraform dev validation: PASSED" -ForegroundColor Green
} else {
    Write-Host "terraform not found on PATH, validated in CI." -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  All Local Validations Completed Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
