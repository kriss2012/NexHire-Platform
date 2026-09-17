#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
    echo "Usage: $0 <path-to-backup.sql.gz or .sql>"
    exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="${DB_CONTAINER:-jobboard-postgres}"
DB_USER="${POSTGRES_USER:-jobboard_user}"
DB_NAME="${POSTGRES_DB:-jobboard_db}"

echo "==> Restoring database ${DB_NAME} from ${BACKUP_FILE}..."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
    gunzip -c "${BACKUP_FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
    docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "==> Database restore completed successfully!"
