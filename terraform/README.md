# YouLend Kubernetes Infrastructure

This repository contains Terraform configurations for deploying components to a Kubernetes cluster with the following:

- Prometheus monitoring (using kube-prometheus-stack Helm chart)
- ELK stack for logging
- Linkerd service mesh
- Deny-by-default network policies
- Seccomp profiles for application security

## Project Structure

```
.
├── README.md
├── main.tf                  # Main Terraform configuration
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── terraform.tfvars.example # Example variable values
├── providers.tf             # Provider configurations
├── versions.tf              # Terraform and provider versions
├── modules/                 # Reusable Terraform modules
│   ├── monitoring/          # Prometheus monitoring module
│   ├── logging/             # ELK stack module
│   ├── service-mesh/        # Linkerd service mesh module
│   ├── security/            # Network policies and seccomp profiles
├── kubernetes/              # Kubernetes manifests
│   ├── network-policies/    # Network policy definitions
│   ├── seccomp/             # Seccomp profile definitions
```

## Prerequisites

- Terraform >= 1.0.0
- kubectl
- Helm
- Access to a Kubernetes cluster
- kubeconfig file with proper access permissions

## Usage

1. Clone this repository
2. Copy `terraform.tfvars.example` to `terraform.tfvars` and update the values
3. Run `terraform init` to initialize the project
4. Run `terraform plan` to see the changes
5. Run `terraform apply` to apply the changes

## Components

### Prometheus Monitoring

Uses the kube-prometheus-stack Helm chart to deploy Prometheus, Grafana, and AlertManager.

### ELK Stack

Deploys Elasticsearch, Logstash, and Kibana for centralized logging.

### Linkerd Service Mesh

Implements Linkerd for service-to-service communication, observability, and security.

### Security

- Network policies that deny traffic by default
- Seccomp profiles to restrict container system calls
