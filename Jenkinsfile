pipeline {
    agent any

    triggers {
        cron('H 8 * * 1-5')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Validar sintaxe') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run check'
                    } else {
                        powershell 'npm.cmd run check'
                    }
                }
            }
        }

        stage('Executar testes e cobertura') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                        if (isUnix()) {
                            sh 'npm run test:coverage'
                        } else {
                            powershell 'npm.cmd run test:coverage'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'reports/junit.xml', allowEmptyResults: false
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
        }
    }
}
