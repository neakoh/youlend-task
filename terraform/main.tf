locals {
  cluster_name = "${var.cluster_name}-${var.environment}"
}

// #########################################################################################################
// ######################################### Namespaces ####################################################
// #########################################################################################################

resource "kubernetes_namespace" "monitoring" {
  count = var.prometheus_enabled ? 1 : 0
  
  metadata {
    name = var.prometheus_namespace
    
    labels = {
      name = var.prometheus_namespace
    }
  }
}

resource "kubernetes_namespace" "logging" {
  count = var.elk_enabled ? 1 : 0
  
  metadata {
    name = var.elk_namespace
    
    labels = {
      name = var.elk_namespace
    }
  }
}

resource "kubernetes_namespace" "linkerd" {
  count = var.linkerd_enabled ? 1 : 0
  
  metadata {
    name = var.linkerd_namespace
    
    labels = {
      name = var.linkerd_namespace
    }
  }
}

resource "kubernetes_namespace" "jenkins" {
  count = var.jenkins_enabled ? 1 : 0
  
  metadata {
    name = var.jenkins_namespace
    
    labels = {
      name = var.jenkins_namespace
    }
  }
}

// #########################################################################################################
// ######################################### Prometheus ####################################################
// #########################################################################################################

resource "helm_release" "prometheus" {
  count      = var.prometheus_enabled ? 1 : 0
  name       = "kube-prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = var.prometheus_chart_version
  namespace  = kubernetes_namespace.monitoring[0].metadata[0].name
  
  values = [
    file("${path.module}/modules/monitoring/prometheus-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.monitoring
  ]
}

// #########################################################################################################
// ############################################# ELK #######################################################
// #########################################################################################################

# Deploy ELK stack using Helm
resource "helm_release" "elasticsearch" {
  count      = var.elk_enabled ? 1 : 0
  name       = "elasticsearch"
  repository = "https://helm.elastic.co"
  chart      = "elasticsearch"
  version    = var.elasticsearch_chart_version
  namespace  = kubernetes_namespace.logging[0].metadata[0].name
  
  values = [
    file("${path.module}/modules/logging/elasticsearch-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.logging
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
    file("${path.module}/modules/logging/kibana-values.yaml")
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
    file("${path.module}/modules/logging/logstash-values.yaml")
  ]
  
  depends_on = [
    kubernetes_namespace.logging,
    helm_release.elasticsearch
  ]
}

// #########################################################################################################
// ######################################### Linkerd #######################################################
// #########################################################################################################


# Deploy Linkerd service mesh using Helm
resource "helm_release" "linkerd_crds" {
  count      = var.linkerd_enabled ? 1 : 0
  name       = "linkerd-crds"
  repository = "https://helm.linkerd.io/stable"
  chart      = "linkerd-crds"
  version    = "1.8.0"
  namespace  = var.linkerd_namespace
  
  depends_on = [
    kubernetes_namespace.linkerd
  ]
}

resource "helm_release" "linkerd_control_plane" {
  count      = var.linkerd_enabled ? 1 : 0
  name       = "linkerd-control-plane"
  repository = "https://helm.linkerd.io/stable"
  chart      = "linkerd-control-plane"
  version    = "1.16.11"
  namespace  = var.linkerd_namespace
  values     = [
    file("${path.module}/modules/service-mesh/linkerd-values.yaml")
  ]
  
  depends_on = [
    helm_release.linkerd_crds
  ]
}

// #########################################################################################################
// ######################################### Network Policies #############################################
// #########################################################################################################

# Apply deny-by-default network policies
resource "kubectl_manifest" "default_deny_ingress" {
  count     = var.network_policy_enabled ? 1 : 0
  yaml_body = file("${path.module}/modules/network-policies/default-deny-ingress.yaml")
}

resource "kubectl_manifest" "default_deny_egress" {
  count     = var.network_policy_enabled ? 1 : 0
  yaml_body = file("${path.module}/modules/network-policies/default-deny-egress.yaml")
}
