
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





