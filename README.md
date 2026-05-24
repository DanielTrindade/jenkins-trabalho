# API de Conversão de Temperatura

Projeto HTTP minimalista em Node.js para demonstrar uma pipeline Jenkins com um escopo simples: dois endpoints de conversão de temperatura.

## Requisitos

- Node.js 22 ou superior
- npm 11 ou superior

## Como executar localmente

```bash
npm run check
npm test
npm start
```

Servidor padrão:

```text
http://localhost:3000
```

## Endpoints

- `GET /docs`
- `GET /openapi.json`
- `GET /fahrenheit-to-celsius?value=212`
- `GET /celsius-to-fahrenheit?value=100`

## Teste manual com Scalar

Com o servidor rodando, abra:

```text
http://localhost:3000/docs
```

Essa rota usa o Scalar para testar manualmente os endpoints pelo navegador.

## Exemplos

```http
GET /fahrenheit-to-celsius?value=32
```

Resposta:

```json
{
  "input": {
    "scale": "F",
    "value": 32
  },
  "output": {
    "scale": "C",
    "value": 0
  }
}
```

```http
GET /celsius-to-fahrenheit?value=0
```

Resposta:

```json
{
  "input": {
    "scale": "C",
    "value": 0
  },
  "output": {
    "scale": "F",
    "value": 32
  }
}
```

## Testes no Jenkins

O pipeline usa:

- `npm run check` para validar sintaxe;
- `npm run test:coverage` para executar testes, gerar `reports/junit.xml` e `reports/lcov.info`.

Os detalhes dos cenários para demonstração estão em [docs/jenkins-cenarios.md](docs/jenkins-cenarios.md).
