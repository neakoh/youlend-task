# k8s.tf
resource "kubernetes_deployment" "express_app" {
  metadata {
    name = "youlend-express-app"
    labels = {
      app = "youlend-express-app"
    }
  }

  spec {
    replicas = var.app_replicas

    selector {
      match_labels = {
        app = "youlend-express-app"
      }
    }

    template {
      metadata {
        labels = {
          app = "youlend-express-app"
        }
      }

      spec {
        container {
          image = "${var.docker_registry}/youlendk8s:${var.app_version}"
          name  = "youlend-express-app"

          port {
            container_port = 3000
          }

          env {
            name  = "PORT"
            value = "3000"
          }

          # Add other environment variables as needed
          dynamic "env" {
            for_each = var.app_environment_variables
            content {
              name  = env.key
              value = env.value
            }
          }

          resources {
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds       = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 5
            period_seconds       = 10
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "express_app" {
  metadata {
    name = "youlend-express-app"
  }

  spec {
    selector = {
      app = kubernetes_deployment.express_app.metadata[0].labels.app
    }

    port {
      port        = 80
      target_port = 3000
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_ingress_v1" "express_app" {
  metadata {
    name = "youlend-express-app"
    annotations = {
      "kubernetes.io/ingress.class"                = "nginx"
      "nginx.ingress.kubernetes.io/ssl-redirect"   = "false"
      "nginx.ingress.kubernetes.io/rewrite-target" = "/"
    }
  }

  spec {
    rule {
      http {
        path {
          path = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service.express_app.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }
}