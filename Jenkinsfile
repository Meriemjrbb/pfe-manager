pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Pré-requis hôte') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              terraform version
              vagrant --version
              VBoxManage --version
              docker compose version
            '''
          } else {
            bat '''
              @echo off
              terraform version
              if errorlevel 1 exit /b 1
              vagrant --version
              if errorlevel 1 exit /b 1
              VBoxManage --version
              if errorlevel 1 exit /b 1
              docker compose version
            '''
          }
        }
      }
    }

    stage('Tests backend') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              python3 -m venv .venv
              . .venv/bin/activate
              python -m pip install -r backend/requirements.txt
              (cd backend && python -m pytest -q)
            '''
          } else {
            bat '''
              @echo off
              python -m venv .venv
              if errorlevel 1 exit /b 1
              .venv\\Scripts\\python.exe -m pip install -r backend/requirements.txt
              if errorlevel 1 exit /b 1
              pushd backend
              ..\\.venv\\Scripts\\python.exe -m pytest -q
              set TEST_RESULT=%ERRORLEVEL%
              popd
              exit /b %TEST_RESULT%
            '''
          }
        }
      }
    }

    stage('Build images Docker') {
      steps {
        script {
          if (isUnix()) {
            sh 'docker compose --env-file .env.example build'
          } else {
            bat 'docker compose --env-file .env.example build'
          }
        }
      }
    }

    stage('Validation Terraform') {
      steps {
        script {
          if (isUnix()) {
            sh '''
              set -eu
              terraform fmt -check -recursive terraform
              terraform -chdir=terraform init -backend=false -input=false
              terraform -chdir=terraform validate
            '''
          } else {
            bat '''
              @echo off
              terraform fmt -check -recursive terraform
              if errorlevel 1 exit /b 1
              terraform -chdir=terraform init -backend=false -input=false
              if errorlevel 1 exit /b 1
              terraform -chdir=terraform validate
            '''
          }
        }
      }
    }
  }
}
