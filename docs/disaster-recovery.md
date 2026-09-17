# Disaster Recovery & Incident Management Plan

This document defines the Disaster Recovery (DR) plan, backup strategies, Recovery Time Objectives (RTO), and Recovery Point Objectives (RPO).

---

## 1. Objectives & Metrics

- **Recovery Point Objective (RPO)**: `< 1 Hour` (Maximum acceptable data loss in catastrophic outage).
- **Recovery Time Objective (RTO)**: `< 15 Minutes` (Maximum acceptable downtime until service is restored).

---

## 2. PostgreSQL Backup & Restoration Procedures

### Local & Containerized Database Backup
Automated script provided in `scripts/backup-db.sh` and `scripts/backup-db.ps1`:
```bash
# Take immediate snapshot backup
./scripts/backup-db.sh
# Stored in ./backups/jobboard_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Database Restoration Procedure
```bash
# Restore from specified snapshot archive
./scripts/restore-db.sh ./backups/jobboard_backup_20260915_120000.sql.gz
```

### Production AWS RDS PostgreSQL Strategy
In an enterprise cloud production deployment:
1. **Multi-AZ Replication**: Synchronous primary-standby replica deployed across 2 Availability Zones.
2. **Automated Snapshots**: Daily automated snapshots retained for 30 days with Point-in-Time Recovery (PITR) capable of restoring to any second within the retention window.
3. **Cross-Region Replication**: Critical snapshots copied asynchronously to a secondary AWS region (e.g. `us-west-2`).

---

## 3. Total Cluster Re-Provisioning via Terraform
If an entire EKS cluster or VPC is deleted:
1. Re-apply infrastructure via Terraform:
   ```bash
   cd terraform/environments/production
   terraform init
   terraform apply -auto-approve
   ```
2. Re-point ArgoCD GitOps root app:
   ```bash
   kubectl apply -f argocd/application.yaml
   ```
3. ArgoCD reconciles the cluster state within 3 minutes.
4. Restore database state from latest RDS / S3 snapshot.
