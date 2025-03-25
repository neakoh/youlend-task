variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
  default     = "youlend-k8s"
}

variable "kubeconfig_path" {
  description = "Path to the kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "kubeconfig_context" {
  description = "Context to use from the kubeconfig file"
  type        = string
  default     = ""
}

# Prometheus variables
variable "prometheus_enabled" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "prometheus_namespace" {
  description = "Kubernetes namespace for Prometheus"
  type        = string
  default     = "monitoring"
}

variable "prometheus_chart_version" {
  description = "Version of the kube-prometheus-stack Helm chart"
  type        = string
  default     = "45.7.1"
}

# ELK stack variables
variable "elk_enabled" {
  description = "Enable ELK stack for logging"
  type        = bool
  default     = true
}

variable "elk_namespace" {
  description = "Kubernetes namespace for ELK stack"
  type        = string
  default     = "logging"
}

variable "elasticsearch_chart_version" {
  description = "Version of the Elasticsearch Helm chart"
  type        = string
  default     = "7.17.3"
}

variable "kibana_chart_version" {
  description = "Version of the Kibana Helm chart"
  type        = string
  default     = "7.17.3"
}

variable "logstash_chart_version" {
  description = "Version of the Logstash Helm chart"
  type        = string
  default     = "7.17.3"
}

# Linkerd variables
variable "linkerd_enabled" {
  description = "Enable Linkerd service mesh"
  type        = bool
  default     = true
}

variable "linkerd_namespace" {
  description = "Kubernetes namespace for Linkerd"
  type        = string
  default     = "linkerd"
}

variable "linkerd_chart_version" {
  description = "Version of the Linkerd Helm chart"
  type        = string
  default     = "stable-2.13.5"
}

# Jenkins variables
variable "jenkins_enabled" {
  description = "Enable Jenkins CI/CD"
  type        = bool
  default     = true
}

variable "jenkins_namespace" {
  description = "Kubernetes namespace for Jenkins"
  type        = string
  default     = "jenkins"
}

variable "jenkins_chart_version" {
  description = "Version of the Jenkins Helm chart"
  type        = string
  default     = "4.3.30"
}

variable "jenkins_persistence_size" {
  description = "Size of the Jenkins persistence volume"
  type        = string
  default     = "8Gi"
}

variable "jenkins_admin_password" {
  description = "Jenkins admin password"
  type        = string
  default     = "admin"
  sensitive   = true
}

# Security variables
variable "network_policy_enabled" {
  description = "Enable deny-by-default network policies"
  type        = bool
  default     = true
}

variable "seccomp_enabled" {
  description = "Enable seccomp profiles"
  type        = bool
  default     = true
}

# variables.tf
variable "app_replicas" {
  description = "Number of replicas for the Express application"
  type        = number
  default     = 2
}

variable "docker_registry" {
  description = "Docker registry where the application image is stored"
  type        = string
}

variable "app_version" {
  description = "Version of the application to deploy"
  type        = string
  default     = "latest"
}

variable "app_environment_variables" {
  description = "Environment variables for the application"
  type        = map(string)
  default     = {}
}
