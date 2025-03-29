resource "kubectl_manifest" "external_virtualservice" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: external-virtualservice
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  hosts:
  - "*"  # Change to your actual domain or use "*" for testing
  gateways:
  - ${kubernetes_namespace.istio-system[0].metadata[0].name}/external-gateway
  http:
  - match:
    - uri:
        prefix: /api/
    rewrite:
      uri: /
    route:
    - destination:
        host: youlend-app-backend.application.svc.cluster.local
        port:
          number: 3000

  - route:
    - destination:
        host: youlend-app-frontend.application.svc.cluster.local
        port:
          number: 80
YAML

  depends_on = [
    helm_release.istio_crds,
    helm_release.istio_control_plane,
    helm_release.prometheus,
    kubectl_manifest.external_gateway
  ]
}