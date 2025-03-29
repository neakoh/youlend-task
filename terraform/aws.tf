// ========================================================================================================
// =============================================== EKS ====================================================
// ========================================================================================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.31"

  cluster_name    = "youlend-k8s"
  cluster_version = "1.31"

  # Optional
  cluster_endpoint_public_access = true

  # Optional: Adds the current caller identity as an administrator via cluster access entry
  enable_cluster_creator_admin_permissions = true

  cluster_compute_config = {
    enabled    = true
    node_pools = ["general-purpose"]
  }

  vpc_id     = module.youlend_k8s_vpc.vpc_id
  subnet_ids = module.youlend_k8s_vpc.private_subnets

  cluster_addons = {
    aws-ebs-csi-driver = {
      most_recent = true
      service_account_role_arn = module.ebs_csi_driver_irsa.iam_role_arn
      configuration_values = jsonencode({
        node = {
          tolerateAllTaints = true
        }
      })
    }
  }

  // Audit Logging
  cluster_enabled_log_types = [
    "api",
    "audit",
    "authenticator",
    "controllerManager",
    "scheduler"
  ]
  create_cloudwatch_log_group = true
  # Optional: Configure log retention
  cloudwatch_log_group_retention_in_days = 90

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}

# Create IAM role for EBS CSI driver using IRSA
module "ebs_csi_driver_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.30"

  role_name = "ebs-csi-driver"
  
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }
}

// ========================================================================================================
// =============================================== VPC ====================================================
// ========================================================================================================

module "youlend_k8s_vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "youlend-k8s-vpc"
  cidr = "192.168.0.0/16"

  azs             = ["eu-west-2a", "eu-west-2b"]
  private_subnets = ["192.168.8.0/24", "192.168.9.0/24"]
  public_subnets  = ["192.168.6.0/24", "192.168.7.0/24"]

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Terraform   = "true"
    Environment = var.environment
  }
}
