# Admin ClusterRole
resource "kubernetes_cluster_role" "admin_role" {
  metadata {
    name = "admin-role"
  }

  rule {
    api_groups = ["*"]
    resources  = ["*"]
    verbs      = ["*"]
  }
}

# Developer Role (more restricted)
resource "kubernetes_role" "developer_role" {
  metadata {
    name      = "developer-role"
    namespace = "default"
  }

  rule {
    api_groups = ["", "apps", "batch"]
    resources  = ["pods", "services", "deployments", "jobs"]
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
  }
}

# Bind roles to service accounts
resource "kubernetes_service_account" "admin_account" {
  metadata {
    name      = "admin-account"
    namespace = "kube-system"
  }
}

resource "kubernetes_cluster_role_binding" "admin_binding" {
  metadata {
    name = "admin-binding"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.admin_role.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.admin_account.metadata[0].name
    namespace = "kube-system"
  }
}