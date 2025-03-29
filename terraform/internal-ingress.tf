resource "kubectl_manifest" "internal_virtualservice" {
  count = var.istio_enabled ? 1 : 0
  yaml_body = <<YAML
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: internal-virtualservice
  namespace: ${kubernetes_namespace.istio-system[0].metadata[0].name}
spec:
  hosts:
  - "*"  # Change to your actual domain or use "*" for testing
  gateways:
  - ${kubernetes_namespace.istio-system[0].metadata[0].name}/internal-gateway
  http:

  - match:
    - uri:
        exact: /grafana
    redirect:
      uri: /grafana/
  - match:
    - uri:
        prefix: /grafana/
    route:
    - destination:
        host: kube-prometheus-stack-grafana.monitoring.svc.cluster.local
        port:
          number: 80

  - match:
    - uri:
        exact: /kibana
    redirect:
      uri: /kibana/
  - match:
    - uri:
        prefix: /kibana/
    rewrite:
      uri: /
    route:
    - destination:
        host: kibana-kibana.logging.svc.cluster.local
        port:
          number: 5601

YAML

  depends_on = [
    helm_release.istio_crds,
    helm_release.istio_control_plane,
    helm_release.prometheus,
    kubectl_manifest.internal_gateway
  ]
}