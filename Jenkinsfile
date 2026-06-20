pipeline {
    // Trabalho 2: nao existe agente global.
    // Cada stage sobe o SEU proprio container Docker isolado:
    //   - um container exclusivo para a etapa de BUILD;
    //   - outro container, limpo e separado, para a etapa de TESTE.
    agent none

    triggers {
        // Cenario 4 ("nightly"): build agendada de segunda a sexta, por volta das 8h.
        // O H distribui o minuto para nao concentrar carga; ajuste para um horario
        // proximo da gravacao quando for demonstrar o agendamento.
        cron('H 8 * * 1-5')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build (container Docker)') {
            // Container #1 - ambiente exclusivo de build.
            agent {
                docker {
                    image 'node:22-alpine'
                    // -u root:root evita problemas de permissao ao escrever no workspace
                    // montado e no cache do npm dentro do container.
                    args '-u root:root'
                }
            }
            steps {
                sh 'echo "Etapa BUILD rodando no container: $(hostname)"'
                sh 'node --version && npm --version'

                // Preparacao do ambiente / instalacao de dependencias (passo de build).
                sh 'npm ci'

                // "Compilacao" de um projeto JavaScript = validacao de sintaxe de todos
                // os fontes com `node --check`. Se algum arquivo tiver erro de sintaxe,
                // este passo falha e o pipeline nem chega na etapa de teste (Cenario 2).
                sh 'npm run check'
            }
            post {
                success {
                    // Empacota o artefato ja validado para entregar ao container de teste.
                    // E isso que demonstra o "build container -> test container":
                    // o que sai do build e' consumido por um container separado.
                    stash name: 'build-artifact',
                          includes: 'src/**,test/**,scripts/**,package.json,package-lock.json'
                }
            }
        }

        stage('Test (container Docker)') {
            // Container #2 - ambiente exclusivo de teste, totalmente isolado do build.
            agent {
                docker {
                    image 'node:22-alpine'
                    args '-u root:root'
                }
            }
            steps {
                sh 'echo "Etapa TESTE rodando no container: $(hostname)"'

                // Recupera no container limpo o artefato gerado pela etapa de build.
                unstash 'build-artifact'

                // catchError marca o build como UNSTABLE (e nao FAILURE) quando um caso
                // de teste falha. E exatamente o Cenario 3: build OK, mas teste quebrou.
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh 'npm run test:coverage'
                }
            }
            post {
                always {
                    // Publica o relatorio JUnit e arquiva cobertura/relatorios mesmo
                    // quando os testes falham, para o resultado aparecer no Jenkins.
                    junit testResults: 'reports/junit.xml', allowEmptyResults: false
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                }
            }
        }
    }
}
