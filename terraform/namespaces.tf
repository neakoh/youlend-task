resource "kubernetes_namespace" "application" {
  count = var.application_enabled ? 1 : 0
  
  metadata {
    name = "application"
    
    labels = {
      name = "application"
      istio-injection = "enabled"
    }
  }
  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "istio-system" {
  count = var.istio_enabled ? 1 : 0
  
  metadata {
    name = "istio-system"
    
    labels = {
      name = "istio-system"
    }
  }
  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "monitoring" {
  count = var.prometheus_enabled ? 1 : 0
  
  metadata {
    name = "monitoring"
    
    labels = {
      name = "monitoring"
    }
  }
  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "logging" {
  count = var.elk_enabled ? 1 : 0
  
  metadata {
    name = "logging"
    
    labels = {
      name = "logging"
    }
  }
  depends_on = [
    module.eks
  ]
}

resource "kubernetes_namespace" "dev" {
  metadata {
    name = "development"
    
    labels = {
      name = "development"
    }
  }
}