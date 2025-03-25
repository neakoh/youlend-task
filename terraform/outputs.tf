output "cluster_name" {
  description = "Kubernetes Cluster Name"
  value       = local.cluster_name
}

output "prometheus_namespace" {
  description = "Kubernetes namespace for Prometheus"
  value       = var.prometheus_enabled ? kubernetes_namespace.monitoring[0].metadata[0].name : null
}

output "logging_namespace" {
  description = "Kubernetes namespace for ELK stack"
  value       = var.elk_enabled ? kubernetes_namespace.logging[0].metadata[0].name : null
}

output "linkerd_namespace" {
  description = "Kubernetes namespace for Linkerd"
  value       = var.linkerd_enabled ? kubernetes_namespace.linkerd[0].metadata[0].name : null
}

output "prometheus_grafana_service" {
  description = "Grafana service name"
  value       = var.prometheus_enabled ? "kube-prometheus-stack-grafana.${kubernetes_namespace.monitoring[0].metadata[0].name}.svc.cluster.local" : null
}

output "kibana_service" {
  description = "Kibana service name"
  value       = var.elk_enabled ? "kibana-kibana.${kubernetes_namespace.logging[0].metadata[0].name}.svc.cluster.local" : null
}

output "elasticsearch_service" {
  description = "Elasticsearch service name"
  value       = var.elk_enabled ? "elasticsearch-master.${kubernetes_namespace.logging[0].metadata[0].name}.svc.cluster.local" : null
}

output "linkerd_dashboard_service" {
  description = "Linkerd dashboard service name"
  value       = var.linkerd_enabled ? "linkerd-web.${kubernetes_namespace.linkerd[0].metadata[0].name}.svc.cluster.local" : null
}
