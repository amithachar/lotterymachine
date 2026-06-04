pipeline {
    agent {
        docker {
            image 'python:3.12'
            args '''
                -u root \
                -v /var/run/docker.sock:/var/run/docker.sock
            '''
        }
    }

    environment {
        PROJECT_ID = "YOUR_GCP_PROJECT"
        REGION     = "asia-south1"
        REPOSITORY = "lottery"
        IMAGE_NAME = "lottery-machine"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        FULL_IMAGE = "${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
        CLUSTER    = "lottery-cluster"
        DEPLOYMENT = "lottery"
    }

    stages {
        stage('Git Checkout') {
            steps {
                git url: 'https://github.com/amithachar/lotterymachine.git', branch: 'main'
            }
        }

        stage('Install Tools') {
            steps {
                sh '''
                    apt-get update
                    apt-get install -y docker.io curl git wget
                    curl https://sdk.cloud.google.com | bash
                    export PATH=$PATH:/root/google-cloud-sdk/bin
                    gcloud version
                    docker --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    python -m pip install --upgrade pip
                    pip install -r requirements.txt
                    pip install pytest
                '''
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                    pytest tests/ -v --junitxml=test-results.xml || true
                '''
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                sh '''
                    pip install pip-audit
                    pip-audit -r requirements.txt -o audit.json || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'audit.json', allowEmptyArchive: true
                }
            }
        }

        stage('Security Scan + Docker Build') {
            parallel {
                stage('Trivy Scan') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                aquasec/trivy image python:3.12
                        '''
                    }
                }
                stage('OPA Dockerfile Rules') {
                    steps {
                        sh '''
                            docker run --rm \
                                -v $(pwd):/project \
                                openpolicyagent/conftest test Dockerfile || true
                        '''
                    }
                }
                stage('Docker Build') {
                    steps {
                        sh 'docker build -t lottery-machine .'
                    }
                }
            }
        }

        stage('Authenticate GCP') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_KEY')]) {
                    sh '''
                        export PATH=$PATH:/root/google-cloud-sdk/bin
                        gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                        gcloud config set project $PROJECT_ID
                        gcloud auth configure-docker ${REGION}-docker.pkg.dev
                    '''
                }
            }
        }

        stage('Tag Image') {
            steps {
                sh 'docker tag lottery-machine $FULL_IMAGE'
            }
        }

        stage('Push Image') {
            steps {
                sh 'docker push $FULL_IMAGE'
            }
        }

        stage('OPA Kubernetes Rules') {
            steps {
                sh '''
                    docker run --rm \
                        -v $(pwd):/project \
                        openpolicyagent/conftest test k8s/deployment.yaml || true
                '''
            }
        }

        stage('Update GitOps Repo') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {
                    sh '''
                        rm -rf lottery-gitops || true
                        git clone https://${GIT_USER}:${GIT_PASS}@github.com/amithachar/lotterygitops.git
                        cd lottery-gitops
                        
                        git config user.email "jenkins@ci.com"
                        git config user.name "jenkins"
                        
                        sed -i "s|image:.*|image: ${FULL_IMAGE}|g" deployment.yaml
                        
                        if ! git diff --quiet; then
                            git add .
                            git commit -m "Update image ${IMAGE_TAG}"
                            git push origin main
                        else
                            echo "No changes"
                        fi
                    '''
                }
            }
        }

        stage('Deploy GKE') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_KEY')]) {
                    sh '''
                        export PATH=$PATH:/root/google-cloud-sdk/bin
                        gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                        gcloud container clusters get-credentials $CLUSTER --region $REGION
                        kubectl set image deployment/$DEPLOYMENT lottery=$FULL_IMAGE
                        kubectl rollout status deployment/$DEPLOYMENT
                    '''
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
            sh '''
                docker logout || true
                docker rmi $FULL_IMAGE || true
            '''
        }
        success {
            echo 'Lottery deployment successful'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}