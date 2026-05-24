# Segunda Atividade Prática — Jenkins

## 1. Descrição da Tarefa

**Disciplina/Período:** 2026-1  
**Tema:** Jenkins integrado ao GitHub  
**Objetivo:** montar uma versão inicial de um processo de **build e testes automáticos** utilizando o Jenkins integrado com um projeto hospedado no GitHub.

---

## 2. Entregáveis

A atividade deve conter os seguintes entregáveis:

1. **Apresentação no Google Presentation**
   - Deve conter os links dos vídeos indicados nos cenários.
   - Não há limite máximo de slides.

2. **Fontes dos métodos utilizados como exemplo**
   - Código-fonte do projeto usado nos builds.
   - Pode ser em Java ou em qualquer outra linguagem de preferência do aluno.

3. **Link do projeto no GitHub**
   - Repositório público ou acessível para avaliação.

---

## 3. O que deve ser feito

### 3.1 Configuração inicial

Configurar uma máquina local com o **Jenkins** e integrá-lo com um projeto pessoal no **GitHub**.

---

### 3.2 Criação do projeto de exemplo

Criar um código-fonte em **Java** ou em outra linguagem de preferência, contendo pelo menos **2 métodos simples**.

Exemplo de métodos:

- Conversão de temperatura de **Fahrenheit para Celsius**.
- Conversão de temperatura de **Celsius para Fahrenheit**.

---

### 3.3 Criação dos testes

Criar, no mínimo, **2 casos de teste** para cada método ou para o conjunto de métodos implementados.

Os testes devem ser executados automaticamente pelo Jenkins durante o processo de build.

---

## 4. Cenários obrigatórios no Jenkins

Cada cenário deve ser demonstrado em vídeo e o link do vídeo deve ser anexado na apresentação.

---

### 4.1 Cenário 1 — Build e testes com sucesso

**Tipo:** vídeo obrigatório  
**Execução:** manual  

Executar o job manualmente no Jenkins.

Resultado esperado:

- O build deve ser executado com sucesso.
- O conjunto de testes também deve ser executado com sucesso.

---

### 4.2 Cenário 2 — Falha na compilação

**Tipo:** vídeo obrigatório  
**Execução:** manual  

Executar o job manualmente no Jenkins com erro proposital no código-fonte.

Resultado esperado:

- O build deve falhar durante o processo de compilação dos fontes.

---

### 4.3 Cenário 3 — Build com sucesso, mas testes falhando

**Tipo:** vídeo obrigatório  
**Execução:** manual  

Executar o job manualmente no Jenkins com erro proposital em um dos métodos, fazendo com que os testes relacionados falhem.

Resultado esperado:

- O build deve compilar com sucesso.
- Os testes devem falhar.
- O Jenkins deve marcar o resultado como **instável**.

---

### 4.4 Cenário 4 — Build agendado

**Tipo:** vídeo obrigatório  
**Execução:** automática por agendamento  

Configurar o Jenkins para executar o job em um horário agendado.

Resultado esperado:

- O Jenkins deve executar o job automaticamente, sem intervenção manual.
- O build deve ser executado com sucesso.
- Os testes devem ser executados com sucesso.

---

### 4.5 Cenário bônus — Cobertura de código

**Tipo:** vídeo bônus  
**Execução:** manual  

Executar o job manualmente com uma métrica de cobertura de código ativada.

Resultado esperado:

- O build deve ser executado com sucesso.
- Os testes devem ser executados com sucesso.
- A porcentagem de cobertura de código realizada pelos testes deve ser apresentada.

---

## 5. Orientações para a apresentação

A apresentação deve ser objetiva, mas sem omitir passos importantes do processo.

O objetivo **não é ensinar a instalar o Jenkins**, mas sim demonstrar:

- Como montar o job no Jenkins.
- Como configurar a integração com o GitHub.
- Como o projeto foi estruturado.
- Quais métodos foram implementados.
- Quais casos de teste foram criados.
- Como o Jenkins executa o build e os testes.
- Como os cenários obrigatórios se comportam.
- Como apresentar métricas de cobertura de código, no cenário bônus.

A apresentação deve ser pensada como se fosse um pequeno curso ou demonstração para alguém da área, como colegas de trabalho, amigos ou liderança técnica.

---

## 6. Vídeos

Para os vídeos, utilizar uma ferramenta de captura de tela.

Ferramenta recomendada:

- OBS Studio

Os vídeos podem ser hospedados em:

- Google Drive
- YouTube
- Outra plataforma acessível

Os links dos vídeos devem ser colocados diretamente na apresentação.

---

## 7. Checklist da atividade

- [ ] Jenkins instalado e configurado localmente.
- [ ] Projeto criado no GitHub.
- [ ] Jenkins integrado ao repositório do GitHub.
- [ ] Projeto com pelo menos 2 métodos simples.
- [ ] Pelo menos 2 casos de teste criados.
- [ ] Job configurado no Jenkins.
- [ ] Cenário 1 gravado: build e testes com sucesso.
- [ ] Cenário 2 gravado: falha na compilação.
- [ ] Cenário 3 gravado: build com sucesso e testes falhando.
- [ ] Cenário 4 gravado: build agendado.
- [ ] Cenário bônus gravado: cobertura de código.
- [ ] Apresentação criada no Google Presentation.
- [ ] Links dos vídeos inseridos na apresentação.
- [ ] Link do GitHub inserido na apresentação.
- [ ] Fontes do projeto disponíveis para avaliação.