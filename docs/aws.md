# AWS Cloud Infrastructure Guide

This guide describes AWS account configuration, IAM OIDC setup for GitHub Actions, and EKS cluster management.

---

## 1. AWS Target Architecture

```
AWS Region (e.g. us-east-1)
  ├── VPC (10.0.0.0/16)
  │    ├── Public Subnets (AZ-a, AZ-b, AZ-c)
  │    │    ├── Internet Gateway
  │    │    ├── NAT Gateway (EIP)
  │    │    └── AWS Application Load Balancer (ALB)
  │    │
  │    └── Private Subnets (AZ-a, AZ-b, AZ-c)
  │         └── Managed EKS Worker Nodes (t3.medium / m6i.large)
  │              ├── Ingress Controller
  │              ├── Frontend Pods
  │              ├── Backend Pods
  │              ├── Redis Pods
  │              └── PostgreSQL StatefulSet
  │
  ├── AWS ECR (Private Repositories)
  │    ├── jobboard-backend (Immutable, KMS encrypted)
  │    └── jobboard-frontend (Immutable, KMS encrypted)
  │
  └── IAM
       ├── GitHub Actions OIDC Provider (token.actions.githubusercontent.com)
       ├── EKS Cluster Execution Role
       └── Worker Node Instance Role
```

---

## 2. GitHub Actions OIDC Federation Setup

Permanent AWS access keys (`AKIA...`) must NEVER be used. Instead, GitHub Actions requests temporary short-lived credentials via AWS STS using OpenID Connect (OIDC).

### Step 1: Verify OIDC Provider via AWS CLI
```bash
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com" \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
```

### Step 2: Configure Trust Policy Scoped to Repository
The IAM role's trust policy only permits tokens originating from the specified GitHub repository and branch:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:your-org/jobboard-devops:*"
        }
      }
    }
  ]
}
```

---

## 3. Connecting to EKS with kubectl

```bash
# Update local kubeconfig with EKS cluster context
aws eks update-kubeconfig \
  --region us-east-1 \
  --name jobboard-production

# Verify cluster connectivity
kubectl get nodes -o wide
```

---

## 4. AWS Load Balancer Controller Installation

```bash
# Install AWS Load Balancer Controller using Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=jobboard-production \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller
```
