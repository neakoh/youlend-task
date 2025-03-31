data "aws_caller_identity" "current" {}

resource "aws_iam_user" "developer_user" {
  name = "developer-user"
}

resource "aws_iam_user" "admin_user" {
  name = "admin-user"
}

resource "aws_iam_role" "developer_role" {
  name = "eks-developer-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = [
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/developer-user",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/CLI"
        ]
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role" "admin_role" {
  name = "eks-admin-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/admin-user"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "kubernetes_config_map_v1" "aws_auth" {
  metadata {
    name      = "aws-auth"
    namespace = "kube-system"
  }

  data = {
    mapRoles = yamlencode([
      {
        rolearn  = aws_iam_role.developer_role.arn
        username = "developer"
        groups   = ["developers"]
      },
      {
        rolearn  = aws_iam_role.admin_role.arn
        username = "admin"
        groups   = ["system:masters"]
      }
    ])
  }
}

resource "kubernetes_role" "developer" {
  metadata {
    name      = "developer"
  }

  rule {
    api_groups = ["", "apps", "batch"]
    resources  = ["pods", "deployments", "services", "configmaps", "jobs"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

resource "kubernetes_role_binding" "developer" {
  metadata {
    name      = "developer-binding"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.developer.metadata[0].name
  }

  subject {
    kind      = "Group"
    name      = "developers"
    api_group = "rbac.authorization.k8s.io"
  }
}