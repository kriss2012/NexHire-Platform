# Terraform Infrastructure as Code Guide

This document details the modular Terraform configurations provisioning AWS resources across `dev`, `staging`, and `production`.

---

## 1. Module Hierarchy

```
terraform/
├── modules/
│   ├── vpc/             # Multi-AZ VPC, IGW, Public/Private subnets, NAT Gateway, Route tables
│   ├── security_groups/ # Ingress ALB SG, EKS Worker Nodes SG, Zero-trust DB/Redis SG
│   ├── ecr/             # KMS-encrypted ECR repos with immutable tags & lifecycle policies
│   ├── iam/             # GitHub Actions OIDC role & policies, EKS cluster role, Worker node roles
│   └── eks/             # EKS 1.30 managed cluster, private node groups, KMS secrets encryption, addons
└── environments/
    ├── dev/             # Lightweight environment (t3.medium nodes, 1 NAT GW)
    ├── staging/         # Multi-AZ staging environment
    └── production/      # High-availability production environment (m6i.large, full HA)
```

---

## 2. Terraform CLI Lifecycle Commands

### Formatting Check
```bash
# Check formatting across all modules
terraform fmt -check -recursive terraform/
```

### Initializing & Validating
```bash
# Initialize dev environment (using local backend for offline syntax validation)
cd terraform/environments/dev
terraform init -backend=false

# Validate HCL syntax and configuration integrity
terraform validate
```
Expected output:
```
Success! The configuration is valid.
```

### Planning Infrastructure Deployment
```bash
# Configure AWS credentials or assume role
export AWS_REGION="us-east-1"

# Generate execution plan
terraform plan -var-file="terraform.tfvars.example" -out=tfplan
```

### Applying Infrastructure
```bash
terraform apply tfplan
```

### Teardown & Destruction
```bash
terraform destroy -var-file="terraform.tfvars.example"
```

---

## 3. Production Hardening Checklist
- **No Static Credentials**: IAM roles are assumed via GitHub Actions OIDC (`sts:AssumeRoleWithWebIdentity`).
- **Private Subnets**: EKS worker nodes reside in private subnets with no public IPv4 addresses.
- **KMS Encryption**: Container images and Kubernetes Secrets are encrypted with AWS KMS customer-managed keys.
- **Remote State**: In production, uncomment the S3 backend block with DynamoDB state locking to prevent concurrent modifications.
