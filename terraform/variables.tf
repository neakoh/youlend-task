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

variable "application_enabled" {
  description = "Enable application deployment"
  type        = bool
  default     = false
}

variable "istio_enabled" {
  description = "Enable Istio"
  type        = bool
  default     = false
}

variable "istio_chart_version" {
  description = "Version of the Istio Helm chart"
  type        = string
  default     = "1.20.0"  # Update this to the latest stable version of Istio
}

variable "prometheus_enabled" {
  description = "Enable prometheus"
  type        = bool
  default     = false
}

variable "elk_enabled" {
  description = "Enable logging"
  type        = bool
  default     = false
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

variable "network_policy_enabled" {
  description = "Enable network policies"
  type        = bool
  default     = false
}

variable "aws_enabled" {
  description = "Enable AWS integration"
  type        = bool
  default     = false
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-west-2"
}