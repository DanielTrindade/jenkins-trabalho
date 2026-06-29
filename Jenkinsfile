pipeline {
    // Trabalho 2 — versao para Jenkins rodando no Windows.
    //
    // Em vez do agente declarativo `agent { docker { ... } }`, subimos cada
    // container com `docker run` explicito. Motivo: no controller Windows o
    // plugin monta o workspace com o caminho do Windows e usa `-w C:/...`, que
    // NAO e' um caminho absoluto valido dentro de um container Linux
    // (node:22-alpine) -> "working directory ... is invalid".
    //
    // Aqui controlamos o mount: o workspace vai para /app e `-w /app` e' um
    // caminho Linux valido. Continuam sendo DOIS containers isolados:
    //   - um `docker run` para o BUILD;
    //   - outro `docker run`, separado, para o TESTE.
    agent any

    triggers {
        // Cenario 4 ("nightly"): build agendada de segunda a sexta, por volta das 8h.
        cron('H 8 * * 1-5')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build (container Docker)') {
            steps {
                echo 'Subindo o container #1 (build)...'
                // Container exclusivo de build: instala deps e "compila" (valida a
                // sintaxe de todos os fontes). `hostname` imprime o ID do container.
                // Se `npm run check` falhar, o passo retorna != 0 e o pipeline para
                // antes do teste (Cenario 2).
                bat 'docker run --rm -v "%CD%":/app -w /app node:22-alpine sh -c "echo === BUILD === && hostname && node --version && npm ci && npm run check"'
            }
        }

        stage('Test (container Docker)') {
            steps {
                echo 'Subindo o container #2 (teste), isolado do build...'
                // Outro container (hostname diferente), montando o mesmo workspace.
                // catchError marca o build como UNSTABLE quando um caso de teste
                // falha, sem abortar como FAILURE (Cenario 3).
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    bat 'docker run --rm -v "%CD%":/app -w /app node:22-alpine sh -c "echo === TESTE === && hostname && npm run test:coverage"'
                }
            }
            post {
                always {
                    // Os relatorios sao escritos no workspace montado, entao o
                    // Jenkins (no host) consegue publica-los e arquiva-los.
                    junit testResults: 'reports/junit.xml', allowEmptyResults: false
                    archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
                }
            }
        }
    }
}
