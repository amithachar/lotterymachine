pipeline {

    agent any

    environment {
        PROJECT_ID      = "durable-catbird-450018-j4"
        REGION          = "asia-south1"
        REGISTRY_REGION = "us-central1"

        REPOSITORY      = "lottery"
        IMAGE_NAME      = "lottery-machine"

        IMAGE_TAG       = "${env.BUILD_NUMBER}"

        FULL_IMAGE =
        "${REGISTRY_REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {

        // ── 1. Checkout ──────────────────────
        stage('Git Checkout') {
            steps {
                checkout scm
            }
        }

        // ── 2. Verify Tools ──────────────────
        stage('Verify Tools') {
            steps {
                sh '''
                    python3 --version
                    docker --version
                    gcloud --version
                '''
            }
        }

        // ── 3. Install Dependencies ──────────
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

        // ── 4. Unit Tests ────────────────────
        stage('Unit Tests') {
            steps {
                sh '''
                    . venv/bin/activate

                    pytest tests/ \
                    --junitxml=test-results.xml \
                    -v
                '''
            }

            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }

        // ── 5. Build Docker ──────────────────
        stage('Docker Build') {
            steps {
                sh '''
                    docker build \
                    -t ${FULL_IMAGE} .
                '''
            }
        }

        // ── 6. Artifact Registry Login ───────
        stage('Artifact Registry Login') {

            steps {

                withCredentials([
                    file(
                        credentialsId: 'gcp-service-account',
                        variable: 'GOOGLE_KEY'
                    )
                ]) {

                    sh '''
                        gcloud auth activate-service-account \
                        --key-file=$GOOGLE_KEY

                        gcloud config set project $PROJECT_ID

                        gcloud auth configure-docker \
                        ${REGISTRY_REGION}-docker.pkg.dev \
                        --quiet
                    '''
                }
            }
        }

        // ── 7. Push Image ────────────────────
        stage('Push Image') {

            steps {

                sh '''
                    docker push ${FULL_IMAGE}
                '''
            }
        }

        // ── 8. Update GitOps Deployment ──────
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

                    git clone \
                    https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/amithachar/lotterygitops.git

                    cd lotterygitops/lotterygame

                    git config user.email "jenkins@ci.com"
                    git config user.name "jenkins"

                    sed -i \
                    "s|image: .*|image: ${FULL_IMAGE}|g" \
                    deployment.yaml

                    if ! git diff --quiet; then

                        git add deployment.yaml

                        git commit \
                        -m "Update lottery image ${IMAGE_TAG}"

                        git push origin main

                    else

                        echo "No changes detected"

                    fi
                    '''
                }
            }
        }

    }

    post {

        always {

            archiveArtifacts \
            artifacts: 'test-results.xml',
            allowEmptyArchive: true

            sh '''
                docker logout || true

                docker rmi \
                ${FULL_IMAGE} || true
            '''

            cleanWs()
        }

        success {
            echo "Pipeline succeeded: ${FULL_IMAGE}"
        }

        failure {
            echo "Pipeline failed"
        }
    }
}