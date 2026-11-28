pipeline {
  agent any

  parameters {
    booleanParam(
      name: 'PROVISION_VM',
      defaultValue: false,
      description: 'Créer ou mettre à jour la VM VirtualBox depuis main'
    )
    booleanParam(
      name: 'DEPLOY',
      defaultValue: false,
      description: 'Déployer l’application sur la VM locale depuis main'
    )
  }

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

    stage('Provisionner la VM') {
      when {
        allOf {
          branch 'main'
          expression { params.PROVISION_VM }
        }
      }
      steps {
        withCredentials([
          string(credentialsId: 'vm-ssh-public-key', variable: 'PUB')
        ]) {
          script {
            if (isUnix()) {
              sh '''
                set -eu
                terraform -chdir=terraform init -backend=false -input=false
                terraform -chdir=terraform apply -auto-approve \
                  -var="public_key=$PUB"
              '''
            } else {
              bat '''
                @echo off
                terraform -chdir=terraform init -backend=false -input=false
                if errorlevel 1 exit /b 1
                terraform -chdir=terraform apply -auto-approve -var="public_key=%PUB%"
              '''
            }
          }
        }
      }
    }

    stage('Déployer sur la VM') {
      when {
        allOf {
          branch 'main'
          expression { params.DEPLOY }
        }
      }
      steps {
        withCredentials([
          sshUserPrivateKey(credentialsId: 'vm-ssh-key', keyFileVariable: 'KEY'),
          string(credentialsId: 'llm-api-key', variable: 'LLM_KEY'),
          string(credentialsId: 'db-password', variable: 'DB_PASS')
        ]) {
          script {
            if (isUnix()) {
              env.VM_IP = sh(
                returnStdout: true,
                script: 'terraform -chdir=terraform output -raw public_ip'
              ).trim()
              env.VM_USER = sh(
                returnStdout: true,
                script: 'terraform -chdir=terraform output -raw ssh_user'
              ).trim()
              sh '''
                set -eu
                printf 'POSTGRES_DB=pfe\\nPOSTGRES_USER=pfe\\nPOSTGRES_PASSWORD=%s\\nLLM_API_KEY=%s\\n' \
                  "$DB_PASS" "$LLM_KEY" > .env.prod
                tar --exclude=.git --exclude=.env --exclude=.env.prod \
                  --exclude=.venv --exclude=node_modules --exclude=dist \
                  --exclude=pfe-manager --exclude=terraform -czf - . |
                  ssh -i "$KEY" -o StrictHostKeyChecking=accept-new \
                    "$VM_USER@$VM_IP" "mkdir -p app && tar -xzf - -C app"
                scp -i "$KEY" -o StrictHostKeyChecking=accept-new \
                  .env.prod "$VM_USER@$VM_IP:app/.env"
                ssh -i "$KEY" -o StrictHostKeyChecking=accept-new \
                  "$VM_USER@$VM_IP" "cd app && sudo docker compose up -d --build"
              '''
            } else {
              env.VM_IP = bat(
                returnStdout: true,
                script: '@echo off\r\nterraform -chdir=terraform output -raw public_ip'
              ).trim()
              env.VM_USER = bat(
                returnStdout: true,
                script: '@echo off\r\nterraform -chdir=terraform output -raw ssh_user'
              ).trim()
              bat '''
                @echo off
                powershell -NoProfile -Command "$lines = @('POSTGRES_DB=pfe','POSTGRES_USER=pfe',('POSTGRES_PASSWORD=' + $env:DB_PASS),('LLM_API_KEY=' + $env:LLM_KEY)); [IO.File]::WriteAllLines('.env.prod', $lines, [System.Text.UTF8Encoding]::new($false))"
                if errorlevel 1 exit /b 1
                tar --exclude=.git --exclude=.env --exclude=.env.prod --exclude=.venv --exclude=node_modules --exclude=dist --exclude=pfe-manager --exclude=terraform -czf - . | ssh -i "%KEY%" -o StrictHostKeyChecking=accept-new "%VM_USER%@%VM_IP%" "mkdir -p app && tar -xzf - -C app"
                if errorlevel 1 exit /b 1
                scp -i "%KEY%" -o StrictHostKeyChecking=accept-new .env.prod "%VM_USER%@%VM_IP%:app/.env"
                if errorlevel 1 exit /b 1
                ssh -i "%KEY%" -o StrictHostKeyChecking=accept-new "%VM_USER%@%VM_IP%" "cd app && sudo docker compose up -d --build"
              '''
            }
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (isUnix()) {
          sh 'rm -f .env.prod'
        } else {
          bat 'if exist .env.prod del /q .env.prod'
        }
      }
    }
  }
}
