
# Lottery Rolling Machine Architecture

<img width="231" height="685" alt="image" src="https://github.com/user-attachments/assets/edc81f03-8320-4d46-b38a-9623468f7eeb" />


# Gitlab Credentials 
<img width="1672" height="526" alt="image" src="https://github.com/user-attachments/assets/b5e3a7ca-6c90-4a35-8fb4-f05344a28727" />

# Install ArgoCD 

To install ArgoCD on your GKE cluster and connect it to your lottery-gitops repo, run these commands.

1. Connect to GKE

If not already connected:

'''
gcloud config set project durable-catbird-450018-j4


For zonal cluster:

gcloud container clusters get-credentials \
lottery-cluster \
--zone us-central1-a

Verify:

kubectl get nodes

Expected:

STATUS   Ready
2. Create ArgoCD Namespace
kubectl create namespace argocd

Verify:

kubectl get ns
3. Install ArgoCD
kubectl apply \
-n argocd \
-f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

Wait:

kubectl get pods -n argocd

Wait until:

Running
4. Expose ArgoCD UI

Change service:

kubectl patch svc argocd-server \
-n argocd \
-p '{"spec":{"type":"LoadBalancer"}}'

Get external IP:

kubectl get svc argocd-server \
-n argocd

Wait until:

EXTERNAL-IP

Open:

http://EXTERNAL-IP
5. Get Initial Admin Password

Run:

kubectl \
-n argocd \
get secret argocd-initial-admin-secret \
-o jsonpath="{.data.password}" \
| base64 -d

Username:

admin

Password:

(output above)

Login.

6. Register GitOps Repository

Inside ArgoCD UI:

Settings
→ Repositories
→ Connect Repo

Repository:

https://github.com/amithachar/lotterygitops.git

Authentication:

Username + GitHub PAT

Connect.

7. Create ArgoCD Application

Run:

kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application

metadata:
  name: lottery

  namespace: argocd

spec:

  project: default

  source:

    repoURL:
      https://github.com/amithachar/lotterygitops.git

    targetRevision: main

    path: .

  destination:

    server:
      https://kubernetes.default.svc

    namespace:
      default

  syncPolicy:

    automated:

      prune: true

      selfHeal: true

EOF
8. Verify Application
kubectl get applications \
-n argocd

Check sync:

kubectl describe application lottery \
-n argocd
9. Test GitOps

Update image in:

lotterygitops/deployment.yaml

Push:

git push

ArgoCD will automatically:

GitHub
↓
Detect change
↓
Sync
↓
Deploy to GKE
