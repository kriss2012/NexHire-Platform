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

  # In production, configure S3 backend with DynamoDB locking
  # backend "s3" {
  #   bucket         = "jobboard-terraform-state-dev"
  #   key            = "dev/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "jobboard-terraform-locks-dev"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "JobBoard"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source              = "../../modules/vpc"
  environment         = "dev"
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  cluster_name        = "jobboard-dev"
}

module "security_groups" {
  source      = "../../modules/security_groups"
  environment = "dev"
  vpc_id      = module.vpc.vpc_id
}

module "ecr" {
  source      = "../../modules/ecr"
  environment = "dev"
}

module "iam" {
  source      = "../../modules/iam"
  environment = "dev"
  github_repo = var.github_repo
}

module "eks" {
  source                 = "../../modules/eks"
  environment            = "dev"
  cluster_name           = "jobboard-dev"
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  cluster_role_arn       = module.iam.eks_cluster_role_arn
  node_role_arn          = module.iam.eks_node_role_arn
  node_security_group_id = module.security_groups.eks_nodes_security_group_id
  instance_types         = ["t3.medium"]
  scaling_config = {
    desired_size = 2
    min_size     = 1
    max_size     = 4
  }
}
