pipeline {

agent any

environment {

IMAGE=
"asia-south1-docker.pkg.dev/project/lottery/app"

}

stages {

stage('Checkout'){

steps{
checkout scm
}
}

stage('Dependency Scan'){

steps{
sh 'pip install safety'
sh 'safety scan'
}
}

stage('Build'){

steps{
sh 'docker build -t $IMAGE:$BUILD_NUMBER .'
}
}

stage('Image Scan'){

steps{
sh '''
trivy image \
$IMAGE:$BUILD_NUMBER
'''
}
}

stage('Push'){

steps{

withCredentials([

file(
credentialsId:
'gcp-key',

variable:
'GOOGLE'
)

]){

sh '''

gcloud auth activate-service-account \
--key-file=$GOOGLE

gcloud auth configure-docker

docker push \
$IMAGE:$BUILD_NUMBER

'''
}
}
}

stage('Deploy GKE'){

steps{

sh '''

gcloud container clusters \
get-credentials \
lottery-cluster \
--region asia-south1

kubectl set image \
deployment/lottery \
lottery=$IMAGE:$BUILD_NUMBER

'''

}

}

}

}