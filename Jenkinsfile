pipeline {
    agent any

    environment {
        PROJECT_ID = "durable-catbird-450018-j4"
        REGION     = "us-central1-a"
        REPOSITORY = "lottery"
        IMAGE_NAME = "lottery-machine"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        FULL_IMAGE = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
        CLUSTER    = "lottery-cluster"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    python3 --version || true
                    docker --version
                    kubectl version --client || true
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    python -m pip install --upgrade pip
                    pip install -r requirements.txt
                    pip install pytest
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh 'pytest tests/ -v || true'
            }
        }

        stage('Build Docker') {
            steps {
                sh 'docker build -t $FULL_IMAGE .'
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_KEY')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                        gcloud config set project $PROJECT_ID
                        gcloud auth configure-docker ${REGION}-docker.pkg.dev
                        docker push $FULL_IMAGE
                    '''
                }
            }
        }

       stage('Update GitOps Deployment') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-creds',
                        usernameVariable: 'GIT_USERNAME',
                        passwordVariable: 'GIT_PASSWORD'
                    )
                ]) {
                    sh '''
                        rm -rf lotterygitops || true
                        git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/amithachar/lotterygitops.git
                        cd lotterygitops
                        
                        git config user.email "jenkins@ci.com"
                        git config user.name "jenkins"
                        
                        sed -i "s|image: .*|image: ${FULL_IMAGE}|g" deployment.yaml
                        cat deployment.yaml
                        
                        if ! git diff --quiet; then
                            git add deployment.yaml
                            git commit -m "Update lottery image ${IMAGE_TAG}"
                            git push origin main
                        else
                            echo "No changes detected"
                        fi
                    '''
                }
            }
        }

        stage('Deploy GKE') {
            steps {
                withCredentials([
                    file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_KEY')
                ]) {
                    sh '''
                        export USE_GKE_GCLOUD_AUTH_PLUGIN=True
                        gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                        gcloud config set project $PROJECT_ID
                        gcloud container clusters get-credentials $CLUSTER --zone $ZONE
                        
                        kubectl apply -f lotterygitops/deployment.yaml
                        kubectl apply -f lotterygitops/service.yaml
                        kubectl rollout status deployment/lottery-deployment
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/*.xml', allowEmptyArchive: true
            sh '''
                docker logout || true
                docker rmi $FULL_IMAGE || true
            '''
            cleanWs()
        }
        success {
            echo 'Lottery deployed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}