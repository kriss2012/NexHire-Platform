param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

$dbContainer = "jobboard-postgres"
$dbUser = $env:POSTGRES_USER
if (-not $dbUser) { $dbUser = "jobboard_user" }
$dbName = $env:POSTGRES_DB
if (-not $dbName) { $dbName = "jobboard_db" }

Write-Host "==> Restoring database $dbName from $BackupFile..." -ForegroundColor Cyan

Get-Content $BackupFile | docker exec -i $dbContainer psql -U $dbUser -d $dbName

Write-Host "==> Database restore completed successfully!" -ForegroundColor Green
