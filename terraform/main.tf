// ========================================================================================================
// ============================================= Application ==============================================
// ========================================================================================================

resource "helm_release" "youlend-application" {
  count = var.application_enabled ? 1 : 0
  name       = "youlend-app"
  chart      = "./youlend-app-helm" 
  namespace  = kubernetes_namespace.application[0].metadata[0].name
  
  # Ensure infrastructure components are installed first
  depends_on = [
    kubernetes_namespace.application,
    helm_release.prometheus,
    kubernetes_secret.jwt_token
  ]
}

// ========================================================================================================
// ======================================= Kube Prometheus Stack ==========================================
// ========================================================================================================

resource "helm_release" "prometheus" {
  count      = var.prometheus_enabled ? 1 : 0
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring[0].metadata[0].name
  
  values = [
    file("${path.module}/values/prometheus-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.monitoring,
    helm_release.istio_control_plane,
    kubernetes_secret.grafana_credentials
  ]
}

// ========================================================================================================
// =============================================== ELK ====================================================
// ========================================================================================================

# Deploy ELK stack using Helm
resource "helm_release" "elasticsearch" {
  count      = var.elk_enabled ? 1 : 0
  name       = "elasticsearch"
  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"
  version    = var.elasticsearch_chart_version
  namespace  = kubernetes_namespace.logging[0].metadata[0].name
  
  values = [
    file("${path.module}/values/logging/elasticsearch-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.logging,
    helm_release.istio_control_plane,
  ]
}

resource "helm_release" "kibana" {
  count      = var.elk_enabled ? 1 : 0
  name       = "kibana"
  repository = "https://helm.elastic.co"
  chart      = "kibana"
  version    = var.kibana_chart_version
  namespace  = kubernetes_namespace.logging[0].metadata[0].name
  
  values = [
    file("${path.module}/values/logging/kibana-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.logging,
    helm_release.elasticsearch
  ]
}

resource "helm_release" "logstash" {
  count      = var.elk_enabled ? 1 : 0
  name       = "logstash"
  repository = "https://helm.elastic.co"
  chart      = "logstash"
  version    = var.logstash_chart_version
  namespace  = kubernetes_namespace.logging[0].metadata[0].name
  values = [
    file("${path.module}/values/logging/logstash-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.logging,
    helm_release.elasticsearch
  ]
}

// ========================================================================================================
// ========================================= Network Policies =============================================
// ========================================================================================================

locals {
  main_namespaces = ["application", "logging", "monitoring", "istio-system"]

  namespace_policies = {
    "application" = [
      "default-deny",
      "dns",
      "monitoring",  # Allow Prometheus to scrape metrics
      "logging",     # Allow sending logs to logging namespace
      "istio"      # Allow traffic from Istio
    ],
    
    "logging" = [
      "default-deny",
      "dns",
      "monitoring",  # Allow Prometheus to scrape metrics
      "application" # Allow receiving logs from applications
    ],
    
    "monitoring" = [
      "default-deny",
      "dns",
      "application", # Allow scraping metrics from applications
      "logging",     # Allow sending logs to logging namespace
      "istio"       # Allow traffic from Istio for dashboards
    ],
    
    "istio-system" = [
      "default-deny",
      "dns",
      "monitoring",  # Allow Prometheus to scrape metrics
      "logging",     # Allow sending logs to logging namespace
      "all-namespaces" # Allow Istio to reach all services  
    ]
  }
  
  # Create a flattened list of namespace+policy pairs
  policy_pairs = flatten([
    for namespace, policies in local.namespace_policies : [
      for policy in policies : {
        namespace = namespace
        policy    = policy
      }
    ]
  ])
  
  # Convert to a map with unique keys
  policy_map = {
    for pair in local.policy_pairs :
    "${pair.namespace}-${pair.policy}" => pair
  }
}

# Create all the network policies
resource "kubectl_manifest" "network_policies" {
  for_each = var.network_policy_enabled ? local.policy_map : {}
  
  yaml_body = file("${path.module}/network-policies/${each.value.policy}.yaml")
  
  # Override the namespace in the YAML
  override_namespace = each.value.namespace

  depends_on = [
    kubernetes_namespace.application,
    kubernetes_namespace.logging,
    kubernetes_namespace.monitoring,
    kubernetes_namespace.istio-system
  ]
}

// ========================================================================================================
// =========================================== Secrets ====================================================
// ========================================================================================================

resource "random_password" "grafana_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_id" "jwt_secret" {
  byte_length = 32
}

resource "kubernetes_secret" "grafana_credentials" {
  count = var.prometheus_enabled ? 1 : 0
  metadata {
    name      = "grafana-credentials"
    namespace = "monitoring"
  }

  data = {
    admin-user = "admin"
    admin-password = random_password.grafana_password.result
  }
  depends_on = [
    kubernetes_namespace.monitoring
  ]
}

resource "kubernetes_secret" "jwt_token" {
  count = var.application_enabled ? 1 : 0
  metadata {
    name      = "jwt-secret"
    namespace = "application"
  }

  data = {
    token = base64encode(random_id.jwt_secret.hex)
  }
  depends_on = [
    kubernetes_namespace.application
  ]
}
