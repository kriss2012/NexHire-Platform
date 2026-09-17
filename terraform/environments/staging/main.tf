terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "JobBoard"
      Environment = "staging"
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source              = "../../modules/vpc"
  environment         = "staging"
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  cluster_name        = "jobboard-staging"
}

module "security_groups" {
  source      = "../../modules/security_groups"
  environment = "staging"
  vpc_id      = module.vpc.vpc_id
}

module "ecr" {
  source      = "../../modules/ecr"
  environment = "staging"
}

module "iam" {
  source      = "../../modules/iam"
  environment = "staging"
  github_repo = var.github_repo
}

module "eks" {
  source                 = "../../modules/eks"
  environment            = "staging"
  cluster_name           = "jobboard-staging"
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  cluster_role_arn       = module.iam.eks_cluster_role_arn
  node_role_arn          = module.iam.eks_node_role_arn
  node_security_group_id = module.security_groups.eks_nodes_security_group_id
  instance_types         = ["t3.large"]
  scaling_config = {
    desired_size = 3
    min_size     = 2
    max_size     = 6
  }
}

output "vpc_id" { value = module.vpc.vpc_id }
output "eks_cluster_name" { value = module.eks.cluster_name }
output "eks_cluster_endpoint" { value = module.eks.cluster_endpoint }
output "backend_ecr_url" { value = module.ecr.backend_repository_url }
output "frontend_ecr_url" { value = module.ecr.frontend_repository_url }
output "github_actions_role_arn" { value = module.iam.github_actions_role_arn }
