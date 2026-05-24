# Cenários para a atividade de Jenkins

## Cenário 1 — build e testes com sucesso

Execute o pipeline com o código como está.

Resultado esperado:

- `npm run check` passa;
- `npm run test:coverage` passa;
- o Jenkins publica `reports/junit.xml`;
- o Jenkins também gera `reports/lcov.info`;
- o build termina como `SUCCESS`.

## Cenário 2 — falha na compilação

Como o projeto é JavaScript puro, a etapa equivalente à compilação é a validação de sintaxe com `node --check`.

Para provocar a falha:

- remova uma chave `}`;
- quebre a assinatura de uma função;
- deixe uma vírgula ou parêntese faltando em `src/app.js`.

Resultado esperado:

- `npm run check` falha;
- a etapa de testes nem precisa executar;
- o Jenkins marca o build como `FAILURE`.

## Cenário 3 — build com sucesso, mas testes falhando

Mantenha a sintaxe válida e altere a regra de negócio.

Sugestões:

- em `src/conversion-service.js`, altere a fórmula de `fahrenheitToCelsius`;
- em `src/app.js`, troque a escala de saída de um dos endpoints.

Resultado esperado:

- `npm run check` continua passando;
- `npm run test:coverage` falha;
- o relatório JUnit é publicado;
- o Jenkins marca o build como `UNSTABLE`.

## Cenário 4 — build agendado

O `Jenkinsfile` já define:

```groovy
cron('H 8 * * 1-5')
```

Você pode manter esse agendamento ou ajustar para um horário mais próximo da gravação.

## Bônus — cobertura de código

O projeto já possui o script:

```bash
npm run test:coverage
```

Ele gera:

- `reports/junit.xml`
- `reports/lcov.info`

## Branches sugeridas para gravação

- `main`: cenário estável com cobertura ativada
- `conversion-cenario-build-sucesso`: mesma base da `main`, para gravação isolada do sucesso
- `conversion-cenario-falha-sintaxe`: falha proposital na etapa de sintaxe
- `conversion-cenario-testes-falhando`: sintaxe válida, mas teste falhando
- `conversion-cenario-build-agendado`: sucesso com cron curto para demonstração
