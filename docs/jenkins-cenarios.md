# Cenários para a atividade de Jenkins (Trabalho 2 — com Docker)

No Trabalho 2 o pipeline roda o **build em um container Docker** e os **testes em
outro container Docker isolado**. Veja [arquitetura-docker.md](arquitetura-docker.md)
para entender o fluxo completo. Cada cenário abaixo descreve o resultado esperado
já nesse contexto de containers.

## Cenário 1 — build e testes com sucesso ("tudo certo!")

Execute o pipeline (job manual) com o código como está.

Resultado esperado:

- o **container de build** sobe, roda `npm ci` e `npm run check` com sucesso;
- o artefato validado é empacotado (`stash`);
- o **container de teste** sobe separado, recupera o artefato (`unstash`) e roda
  `npm run test:coverage` com sucesso;
- o Jenkins publica `reports/junit.xml` e arquiva `reports/lcov.info`;
- o build termina como `SUCCESS`.

No log dá para ver dois `hostname` diferentes — um por container — provando o
isolamento.

## Cenário 2 — falha na compilação ("deu ruim!")

Como o projeto é JavaScript puro, a etapa equivalente à compilação é a validação
de sintaxe com `node --check`, executada **dentro do container de build**.

Para provocar a falha (em `src/app.js`, por exemplo):

- remova uma chave `}`;
- quebre a assinatura de uma função;
- deixe uma vírgula ou parêntese faltando.

Resultado esperado:

- `npm run check` falha **dentro do container de build**;
- como o `stash` só ocorre no sucesso do build, o **container de teste nem chega
  a ser criado**;
- o Jenkins marca o build como `FAILURE`.

## Cenário 3 — build com sucesso, mas testes falhando ("tá instável!")

Mantenha a sintaxe válida (o build passa) e altere a regra de negócio para
quebrar um caso de teste.

Sugestões:

- em `src/conversion-service.js`, altere a fórmula de `fahrenheitToCelsius`;
- em `src/app.js`, troque a escala de saída de um dos endpoints.

Resultado esperado:

- o **container de build** passa normalmente e gera o artefato;
- o **container de teste** sobe, roda os testes e um caso falha;
- o `catchError(buildResult: 'UNSTABLE')` captura a falha;
- o relatório JUnit é publicado mesmo assim;
- o Jenkins marca o build como `UNSTABLE`.

## Cenário 4 — build agendado ("o lendário nightly")

O `Jenkinsfile` já define o gatilho agendado:

```groovy
cron('H 8 * * 1-5')
```

Para a demonstração, ajuste para um horário próximo da gravação (por exemplo,
daqui a alguns minutos) e deixe o Jenkins disparar o job **sozinho**, sem clicar
em "Build Now". O resultado deve ser build e testes com sucesso, exatamente como
o Cenário 1 — só que iniciado pelo agendador.

> Dica: o gatilho `cron` só passa a valer depois que o job é salvo/escaneado pelo
> menos uma vez. Salve o pipeline antes do horário agendado.

## Bônus — cobertura de código

O artefato de teste já gera, dentro do container de teste:

- `reports/junit.xml`
- `reports/lcov.info`

via o script:

```bash
npm run test:coverage
```

## Pré-requisitos

Antes de rodar qualquer cenário, garanta na máquina do Jenkins:

- Docker Desktop em modo **Linux containers** e rodando;
- plugin **Docker Pipeline** instalado;
- permissão do Jenkins para usar o Docker.

## Branches sugeridas para gravação

- `main`: cenário estável (build + teste em containers, com sucesso)
- `conversion-cenario-build-sucesso`: mesma base da `main`, para gravar o sucesso
- `conversion-cenario-falha-sintaxe`: falha proposital na compilação (Cenário 2)
- `conversion-cenario-testes-falhando`: build OK, teste falhando (Cenário 3)
- `conversion-cenario-build-agendado`: sucesso com cron curto para o nightly
