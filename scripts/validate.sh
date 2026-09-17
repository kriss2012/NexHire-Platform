#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "  Running JobBoard DevSecOps Comprehensive Validation"
echo "=========================================================="

echo "--> 1. Validating backend..."
cd backend
npm run lint
npm run build
npm test
cd ..

echo "--> 2. Validating frontend..."
cd frontend
npm run lint
npm run build
cd ..

echo "--> 3. Checking Kubernetes manifests syntax..."
if command -v kubectl &> /dev/null; then
    kubectl apply -f kubernetes/ --dry-run=client
else
    echo "kubectl not found locally, skipping client dry-run (validated by CI kubeconform)."
fi

echo "--> 4. Linting Helm chart..."
if command -v helm &> /dev/null; then
    helm lint helm/jobboard
    helm template jobboard helm/jobboard -f helm/jobboard/values-dev.yaml > /dev/null
else
    echo "helm not found locally, skipping helm lint."
fi

echo "--> 5. Checking Terraform configurations..."
if command -v terraform &> /dev/null; then
    terraform -chdir=terraform/environments/dev fmt -check
    terraform -chdir=terraform/environments/dev init -backend=false
    terraform -chdir=terraform/environments/dev validate
else
    echo "terraform not found locally, skipping terraform validate."
fi

echo "=========================================================="
echo "  All Validation Checks Passed Successfully!"
echo "=========================================================="
