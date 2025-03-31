resource "helm_release" "istio_crds" {
  count      = var.istio_enabled ? 1 : 0
  name       = "istio-base"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "base"
  version    = var.istio_chart_version
  namespace  = kubernetes_namespace.istio-system[0].metadata[0].name
  
  depends_on = [
    kubernetes_namespace.istio-system
  ]
}

resource "helm_release" "istio_control_plane" {
  count      = var.istio_enabled ? 1 : 0
  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"
  version    = var.istio_chart_version
  namespace  = kubernetes_namespace.istio-system[0].metadata[0].name
  values = [
    file("${path.module}/values/istio-values.yaml")
  ]
  depends_on = [
    helm_release.istio_crds
  ]
}

// ============================================= Internal Ingress ============================================

resource "helm_release" "internal_istio_gateway" {
  count      = var.istio_enabled ? 1 : 0
  name       = "internal-istio-ingress"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "gateway"
  version    = var.istio_chart_version
  namespace  = kubernetes_namespace.istio-system[0].metadata[0].name
  wait    = false
  set {
    name  = "service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internal"
  }
  depends_on = [
    helm_release.istio_control_plane
  ]
}

resource "kubectl_manifest" "internal_gateway" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: internal-gateway
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  selector:
    app: internal-istio-ingress
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
YAML

  depends_on = [
    helm_release.istio_crds,
    helm_release.istio_control_plane
  ]
}

// ========================================= External Gateway ============================================

resource "helm_release" "external_istio_gateway" {
  count      = var.istio_enabled ? 1 : 0
  name       = "external-istio-ingress"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "gateway"
  version    = var.istio_chart_version
  namespace  = kubernetes_namespace.istio-system[0].metadata[0].name
  wait    = false
  set {
    name  = "service.annotations.service\\.beta\\.kubernetes\\.io/aws-load-balancer-scheme"
    value = "internet-facing"
  }
  depends_on = [
    helm_release.istio_control_plane
  ]
}

resource "kubectl_manifest" "external_gateway" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: external-gateway
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  selector:
    app: external-istio-ingress
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - "*"
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    hosts:
    - "*"
    tls:
      mode: SIMPLE
      credentialName: istio-ingressgateway-certs
YAML

  depends_on = [
    helm_release.istio_crds,
    helm_release.istio_control_plane,
    kubectl_manifest.gateway_certificate
  ]
}

// ============================================== Mutual TLS ==============================================

resource "kubectl_manifest" "istio_mtls" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  mtls:
    mode: PERMISSIVE
YAML

  depends_on = [
    helm_release.istio_crds,
    helm_release.istio_control_plane
  ]
}

// ========================================================================================================
// =============================================== Certificate ============================================
// ========================================================================================================

resource "helm_release" "cert_manager" {
  count      = var.istio_enabled ? 1 : 0
  name       = "cert-manager"
  repository = "https://charts.jetstack.io"
  chart      = "cert-manager"
  namespace  = "cert-manager"
  create_namespace = true
  
  set {
    name  = "installCRDs"
    value = "true"
  }
  
  depends_on = [
    module.eks
  ]
}

resource "kubectl_manifest" "self_signed_issuer" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-issuer
spec:
  selfSigned: {}
YAML

  depends_on = [
    helm_release.cert_manager
  ]
}

resource "kubectl_manifest" "gateway_certificate" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: istio-ingressgateway-certs
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  secretName: istio-ingressgateway-certs
  commonName: "kubernetes-demo"
  dnsNames:
  - "kubernetes-demo"
  - "*.elb.amazonaws.com"
  issuerRef:
    name: selfsigned-issuer
    kind: ClusterIssuer
YAML

  depends_on = [
    kubectl_manifest.self_signed_issuer
  ]
}