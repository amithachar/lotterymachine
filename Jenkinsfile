pipeline {
    agent any

    environment {
        PROJECT_ID = "durable-catbird-450018-j4"
        REGION     = "us-central1-a	"
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
                    python3 -m pip install --upgrade pip
                    pip3 install -r requirements.txt
                    pip3 install pytest
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

        stage('Deploy GKE') {
            steps {
                sh '''
                    gcloud container clusters get-credentials $CLUSTER --region $REGION
                    kubectl set image deployment/lottery-deployment lottery=$FULL_IMAGE
                    kubectl rollout status deployment/lottery-deployment
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful"
        }
        failure {
            echo "Pipeline Failed"
        }
        always {
            cleanWs()
        }
    }
}