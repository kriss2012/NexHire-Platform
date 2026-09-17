param(
    [string]$BackupDir = "./backups"
)

$ErrorActionPreference = "Stop"
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$BackupDir/jobboard_backup_$timestamp.sql"

$dbContainer = "jobboard-postgres"
$dbUser = $env:POSTGRES_USER
if (-not $dbUser) { $dbUser = "jobboard_user" }
$dbName = $env:POSTGRES_DB
if (-not $dbName) { $dbName = "jobboard_db" }

Write-Host "==> Backing up PostgreSQL database ($dbName) to $backupFile..." -ForegroundColor Cyan

if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker exec -t $dbContainer pg_dump -U $dbUser -d $dbName > $backupFile
    Write-Host "==> Backup completed successfully: $backupFile" -ForegroundColor Green
} else {
    Write-Host "Docker not running locally. Backup documented for container/RDS environments." -ForegroundColor Yellow
}
