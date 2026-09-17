#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "${BACKUP_DIR}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/jobboard_backup_${TIMESTAMP}.sql.gz"

DB_CONTAINER="${DB_CONTAINER:-jobboard-postgres}"
DB_USER="${POSTGRES_USER:-jobboard_user}"
DB_NAME="${POSTGRES_DB:-jobboard_db}"

echo "==> Backing up PostgreSQL database (${DB_NAME}) to ${BACKUP_FILE}..."

if docker ps | grep -q "${DB_CONTAINER}"; then
    docker exec -t "${DB_CONTAINER}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_FILE}"
    echo "==> Backup completed successfully: ${BACKUP_FILE}"
else
    echo "PostgreSQL container ${DB_CONTAINER} not running. Backing up local state."
fi
