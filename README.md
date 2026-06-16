
# Lottery Rolling Machine Architecture

```text
┌──────────────────────────┐
│        Developer         │
│  Push code → GitHub      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│         Jenkins          │
│      (CI Pipeline)       │
│                          │
│ 1. Checkout Code         │
│ 2. Install Dependencies  │
│ 3. Run Unit Tests        │
│ 4. Build Docker Image    │
│ 5. Push Container        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Google Artifact Registry │
│                          │
│ lottery-machine:build#   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       GitOps Repo        │
│      (lotterygitops)     │
│                          │
│ deployment.yaml          │
│ image tag updated        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      ArgoCD (GitOps)     │
│   Watches GitOps Repo    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    Google Kubernetes     │
│   Engine (GKE Cluster)   │
│                          │
│ Deployment               │
│ Service                  │
│ Pods                     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│          Users           │
│    Access Application    │
└──────────────────────────┘


# Updated

                    ┌──────────────────────┐
                    │      End Users       │
                    │  Browser / Mobile    │
                    └──────────┬───────────┘
                               │
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │     hulkpower.in     │
                    │   Google Cloud DNS   │
                    └──────────┬───────────┘
                               │
                               │ Resolve Domain
                               ▼
                    ┌──────────────────────┐
                    │ GKE Load Balancer    │
                    │ External IP          │
                    └──────────┬───────────┘
                               │
                               │
                    ┌──────────▼───────────┐
                    │ Kubernetes Service   │
                    │ Type=LoadBalancer    │
                    │ lottery-service      │
                    └──────────┬───────────┘
                               │
                               │
                    ┌──────────▼───────────┐
                    │ Kubernetes Deployment│
                    │ lottery-deployment   │
                    │ replicas: 2          │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────▼─┐ ┌──▼─────────┐
                 │ Lottery Pod│ │ Lottery Pod│
                 │ Flask App  │ │ Flask App  │
                 │ Gunicorn   │ │ Gunicorn   │
                 └────────────┘ └────────────┘


────────────────────────────────────────────────

              CI/CD + GitOps FLOW

┌────────────────────┐
│ GitHub Source Repo │
│ (Lottery App Code) │
└──────────┬─────────┘
           │
           │ webhook
           ▼

┌────────────────────┐
│      Jenkins       │
│ Build + Test       │
│ Docker Build       │
│ Push Image         │
└──────────┬─────────┘
           │
           ▼

┌──────────────────────────┐
│ Google Artifact Registry │
│ lottery/lottery-machine  │
└──────────┬───────────────┘
           │
           ▼

┌──────────────────────────┐
│ GitOps Repository        │
│ deployment.yaml          │
│ service.yaml             │
└──────────┬───────────────┘
           │
           ▼

┌──────────────────────────┐
│ ArgoCD (Inside GKE)      │
│ Watches Git Repo         │
└──────────┬───────────────┘
           │
           ▼

┌──────────────────────────┐
│ Kubernetes Cluster (GKE) │
│ Sync Deployment          │
└──────────────────────────┘


Components in your project
Layer	                      Service
Source Control	            GitHub
CI	                        Jenkins
Container  Registry	        Google Artifact Registry
GitOps	                    GitHub GitOps Repo
CD	                        ArgoCD
Orchestration	              GKE
Networking	                GKE LoadBalancer
DNS	                        Google Cloud DNS
Runtime	                    flask + Gunicorn
Container                 	Docker

Optional production upgrades

Cloud Armor
↓
HTTPS Load Balancer
↓
Managed SSL Certificate
↓
GKE Ingress
↓
Prometheus + Grafana
↓
Cloud Monitoring
↓
Cloud Logging

