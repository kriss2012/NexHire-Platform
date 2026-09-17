.PHONY: help install dev test lint build docker-build docker-up docker-down k8s-validate helm-lint terraform-validate clean

help:
	@echo "=========================================================="
	@echo "  JobBoard DevSecOps Platform - Standard Control Interface"
	@echo "=========================================================="
	@echo "  make install            Install root, backend, frontend deps"
	@echo "  make dev                Run backend and frontend in dev mode"
	@echo "  make test               Run unit, integration, and API tests"
	@echo "  make lint               Run linting across backend & frontend"
	@echo "  make build              Build production assets"
	@echo "  make docker-build       Build backend & frontend Docker images"
	@echo "  make docker-up          Start complete stack via Docker Compose"
	@echo "  make docker-down        Stop Docker Compose stack"
	@echo "  make k8s-validate       Validate Kubernetes YAML manifests"
	@echo "  make helm-lint          Lint and template test Helm charts"
	@echo "  make terraform-validate Format check and validate Terraform IaC"
	@echo "  make clean              Remove build artifacts and dependencies"
	@echo "=========================================================="

install:
	@echo "--> Installing backend dependencies..."
	cd backend && npm install
	@echo "--> Installing frontend dependencies..."
	cd frontend && npm install

dev:
	@echo "--> Starting local development environment..."
	npm run dev

test:
	@echo "--> Running backend test suite..."
	cd backend && npm test
	@echo "--> Running frontend test suite..."
	cd frontend && npm test

lint:
	@echo "--> Linting backend codebase..."
	cd backend && npm run lint
	@echo "--> Linting frontend codebase..."
	cd frontend && npm run lint

build:
	@echo "--> Compiling backend TypeScript..."
	cd backend && npm run build
	@echo "--> Building frontend production bundle..."
	cd frontend && npm run build

docker-build:
	@echo "--> Building Docker containers..."
	docker build -t jobboard-backend:latest -f docker/backend.Dockerfile backend
	docker build -t jobboard-frontend:latest -f docker/frontend.Dockerfile frontend

docker-up:
	@echo "--> Starting stack with Docker Compose..."
	docker compose -f docker-compose.yml up -d --build

docker-down:
	@echo "--> Stopping Docker Compose stack..."
	docker compose -f docker-compose.yml down

k8s-validate:
	@echo "--> Validating Kubernetes YAML manifests..."
	kubectl apply -f kubernetes/ --dry-run=client

helm-lint:
	@echo "--> Linting Helm chart..."
	helm lint helm/jobboard
	@echo "--> Testing Helm template rendering..."
	helm template jobboard helm/jobboard -f helm/jobboard/values-dev.yaml > /dev/null

terraform-validate:
	@echo "--> Validating Terraform configurations..."
	cd terraform/environments/dev && terraform init -backend=false && terraform validate
	cd terraform/environments/staging && terraform init -backend=false && terraform validate
	cd terraform/environments/production && terraform init -backend=false && terraform validate

clean:
	@echo "--> Cleaning up build artifacts..."
	rm -rf backend/dist frontend/dist
