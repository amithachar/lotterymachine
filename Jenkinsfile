pipeline {
    agent any
    
    environment {
        PROJECT_ID = "durable-catbird-450018-j4"
        REGION = "asia-south1"
        REGISTRY_REGION = "us-central1"
        REPOSITORY = "lottery"
        IMAGE_NAME = "lottery-machine"
        IMAGE_TAG = "${BUILD_NUMBER}"
        FULL_IMAGE = "${REGISTRY_REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
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
                    python3 --version
                    docker --version
                    gcloud --version
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
                    pip install bandit
                    pip install pip-audit
                '''
            }
        }
        
        stage('Secret Scan') {
            steps {
                sh '''
                    docker run --rm \
                      -v $(pwd):/repo \
                      zricethezav/gitleaks:latest \
                      detect \
                      --source=/repo
                '''
            }
        }
        
        stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck(
                            odcInstallation: 'OWASP',
                            additionalArguments: '--scan . --format XML'
                        )
                    }
                }

        stage('Publish OWASP Report') {
            steps {
                dependencyCheckPublisher(pattern: '**/dependency-check-report.xml')
            }
        }
        
        stage('Bandit SAST') {

            steps {

                sh '''
                . venv/bin/activate

                mkdir -p reports

                bandit \
                -r . \
                -x ./venv,./tests \
                -f html \
                -o reports/bandit-report.html

                bandit \
                -r . \
                -x ./venv,./tests \
                -f txt
                '''
            }

            post {
                always {
                    archiveArtifacts \
                    artifacts: 'reports/*',
                    allowEmptyArchive: true
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh '''
                    . venv/bin/activate
                    pytest tests/ --junitxml=test-results.xml -v
                '''
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }
        
        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        . venv/bin/activate
                        sonar-scanner \
                          -Dsonar.projectKey=lottery \
                          -Dsonar.projectName=lottery \
                          -Dsonar.sources=. \
                          -Dsonar.python.version=3.11
                    '''
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t ${FULL_IMAGE} .
                '''
            }
        }
        
        stage('Trivy Scan') {
            steps {
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy image \
                      --severity HIGH,CRITICAL \
                      ${FULL_IMAGE}
                '''
            }
        }
        
        stage('Artifact Registry Login') {
            steps {
                withCredentials([file(credentialsId: 'gcp-service-account', variable: 'GOOGLE_KEY')]) {
                    sh '''
                        gcloud auth activate-service-account --key-file=$GOOGLE_KEY
                        gcloud config set project $PROJECT_ID
                        gcloud auth configure-docker ${REGISTRY_REGION}-docker.pkg.dev --quiet
                    '''
                }
            }
        }
        
        stage('Push Image') {
            steps {
                sh '''
                    docker push ${FULL_IMAGE}
                '''
            }
        }
        
        stage('Update GitOps') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-creds', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                    sh '''
                        rm -rf lotterygitops
                        git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/amithachar/lotterygitops.git
                        cd lotterygitops/lotterygame
                        
                        git config user.email "jenkins@ci.com"
                        git config user.name "jenkins"
                        
                        sed -i "s|image: .*|image: ${FULL_IMAGE}|g" deployment.yaml
                        
                        git add deployment.yaml
                        git commit -m "Update image ${IMAGE_TAG}" || true
                        git push origin main
                    '''
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
            cleanWs()
        }
        success {
            echo "DevSecOps Pipeline Success"
        }
        failure {
            echo "Pipeline Failed"
        }
    }
} 