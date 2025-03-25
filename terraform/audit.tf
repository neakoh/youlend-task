# Create ConfigMap for audit policy
resource "kubernetes_config_map" "audit_policy" {
  metadata {
    name      = "audit-policy"
    namespace = "kube-system"
  }

  data = {
    "audit-policy.yaml" = <<-EOT
      apiVersion: audit.k8s.io/v1
      kind: Policy
      rules:
      - level: Metadata
        omitStages:
          - "RequestReceived"
        verbs: ["create", "update", "patch", "delete"]

      - level: RequestResponse
        resources:
        - group: ""
          resources: ["pods", "services"]

      - level: RequestResponse
        resources:
        - group: "authentication.k8s.io"
          resources: ["*"]
        - group: "authorization.k8s.io"
          resources: ["*"]

      - level: Metadata
    EOT
  }
}