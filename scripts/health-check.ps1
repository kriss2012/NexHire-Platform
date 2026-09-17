param(
    [string]$TargetUrl = "http://localhost:3001"
)

$ErrorActionPreference = "Stop"
Write-Host "==> Probing Health Endpoints on: $TargetUrl" -ForegroundColor Cyan

Write-Host "--> Testing Liveness (/live)..." -ForegroundColor Yellow
$live = Invoke-RestMethod -Uri "$TargetUrl/live" -Method Get
if ($live.alive -eq $true) {
    Write-Host "    [PASS] Liveness probe OK" -ForegroundColor Green
} else {
    throw "Liveness check failed"
}

Write-Host "--> Testing Readiness (/ready)..." -ForegroundColor Yellow
$ready = Invoke-RestMethod -Uri "$TargetUrl/ready" -Method Get
if ($ready.ready -eq $true) {
    Write-Host "    [PASS] Readiness probe OK" -ForegroundColor Green
} else {
    throw "Readiness check failed"
}

Write-Host "--> Testing Health (/health)..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$TargetUrl/health" -Method Get
Write-Host "    [PASS] Health report status: $($health.status)" -ForegroundColor Green

Write-Host "--> Testing Metrics (/metrics)..." -ForegroundColor Yellow
$metrics = Invoke-WebRequest -Uri "$TargetUrl/metrics" -Method Get
if ($metrics.Content -match "http_requests_total") {
    Write-Host "    [PASS] Prometheus metrics OK" -ForegroundColor Green
} else {
    throw "Metrics check failed"
}

Write-Host "==> All Service Probes Healthy!" -ForegroundColor Green
