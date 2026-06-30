/* Deck: Jenkins + Docker — Build e testes em containers isolados (GdC / UFAM) */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Si = require("react-icons/si");
const Fa = require("react-icons/fa");

// ---------- paleta (DevOps console, dark) ----------
const C = {
  bg: "0D1117",        // fundo profundo
  panel: "161B22",     // cartoes
  panel2: "1C2330",
  line: "30363D",      // bordas
  text: "E6EDF3",      // texto principal
  muted: "8B949E",     // texto secundario
  blue: "2496ED",      // Docker blue (accent dominante)
  cyan: "39C5CF",
  green: "3FB950",     // SUCCESS
  amber: "D29922",     // UNSTABLE
  red: "F85149",       // FAILURE
  purple: "BC8CFF",
};
const HEAD = "Consolas";
const BODY = "Calibri";

// ---------- icones ----------
const ICONS = {
  docker: Si.SiDocker, jenkins: Si.SiJenkins, github: Si.SiGithub, node: Si.SiNodedotjs,
  check: Fa.FaCheckCircle, times: Fa.FaTimesCircle, warn: Fa.FaExclamationTriangle,
  clock: Fa.FaRegClock, server: Fa.FaServer, cube: Fa.FaCube, vial: Fa.FaVial,
  branch: Fa.FaCodeBranch, list: Fa.FaListUl, cogs: Fa.FaCogs, chart: Fa.FaChartBar,
  arrow: Fa.FaArrowRight, diagram: Fa.FaProjectDiagram, plug: Fa.FaPlug,
  terminal: Fa.FaTerminal, box: Fa.FaBoxOpen, link: Fa.FaLink, layer: Fa.FaLayerGroup,
  thermo: Fa.FaThermometerHalf, play: Fa.FaPlayCircle, gear: Fa.FaCog, key: Fa.FaKey,
};
const _cache = {};
async function icon(name, color = "#FFFFFF", size = 256) {
  const key = name + color;
  if (_cache[key]) return _cache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(ICONS[name], { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const data = "image/png;base64," + png.toString("base64");
  _cache[key] = data;
  return data;
}

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
const W = 13.3, H = 7.5, M = 0.6;

// ---------- helpers ----------
function bg(slide, color = C.bg) { slide.background = { color }; }

function footer(slide, n) {
  slide.addShape(pres.shapes.RECTANGLE, { x: M, y: 7.02, w: 0.14, h: 0.14, fill: { color: C.blue }, line: { type: "none" } });
  slide.addText("Jenkins + Docker  ·  Gerência de Configuração — UFAM", {
    x: M + 0.22, y: 6.92, w: 8, h: 0.34, fontFace: HEAD, fontSize: 9, color: C.muted, align: "left", valign: "middle", margin: 0,
  });
  if (n) slide.addText(String(n).padStart(2, "0"), {
    x: W - 1.2, y: 6.92, w: 0.6, h: 0.34, fontFace: HEAD, fontSize: 9, color: C.muted, align: "right", valign: "middle", margin: 0,
  });
}

function header(slide, kicker, title) {
  slide.addText(kicker.toUpperCase(), {
    x: M, y: 0.42, w: 11, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 2, bold: true, margin: 0,
  });
  slide.addText(title, {
    x: M, y: 0.72, w: W - 2 * M, h: 0.7, fontFace: HEAD, fontSize: 27, color: C.text, bold: true, margin: 0, valign: "top",
  });
}

async function iconChip(slide, x, y, name, fillColor, iconColor = "#FFFFFF", d = 0.62) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, rectRadius: 0.08, fill: { color: fillColor }, line: { type: "none" } });
  slide.addImage({ data: await icon(name, iconColor), x: x + d * 0.22, y: y + d * 0.22, w: d * 0.56, h: d * 0.56 });
}

function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: opts.fill || C.panel }, line: { color: opts.line || C.line, width: 1 },
  });
}

function codeBox(slide, x, y, w, h, lines, opts = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: "0B0F14" }, line: { color: C.line, width: 1 } });
  // três bolinhas estilo terminal
  ["F85149", "D29922", "3FB950"].forEach((c, i) =>
    slide.addShape(pres.shapes.OVAL, { x: x + 0.18 + i * 0.2, y: y + 0.16, w: 0.1, h: 0.1, fill: { color: c }, line: { type: "none" } }));
  slide.addText(lines, {
    x: x + 0.22, y: y + 0.42, w: w - 0.44, h: h - 0.6, fontFace: HEAD, fontSize: opts.fontSize || 11.5,
    color: C.text, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 1.12,
  });
}

function pill(slide, x, y, w, text, color) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color: C.bg }, line: { color, width: 1.25 } });
  slide.addText(text, { x, y, w, h: 0.34, fontFace: HEAD, fontSize: 10.5, color, bold: true, align: "center", valign: "middle", margin: 0 });
}

// código colorido (helper p/ runs)
const t = (text, color, opts = {}) => ({ text, options: { color, fontFace: HEAD, ...opts } });

// =====================================================================
// SLIDE 1 — CAPA
// =====================================================================
async function s1() {
  const s = pres.addSlide(); bg(s);
  // moldura "container" sutil
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y: 0.35, w: W - 0.7, h: H - 0.7, rectRadius: 0.12, fill: { type: "none" }, line: { color: C.line, width: 1 } });
  // grid de pontinhos decorativo (canto)
  await iconChip(s, M + 0.1, 1.0, "jenkins", C.panel, "#D33833", 0.9);
  await iconChip(s, M + 1.15, 1.0, "docker", C.panel, C.blue, 0.9);

  s.addText("PIPELINE CI/CD", { x: M + 0.12, y: 2.15, w: 8, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.blue, charSpacing: 3, bold: true, margin: 0 });
  s.addText("Jenkins + Docker", { x: M + 0.05, y: 2.45, w: 11.5, h: 0.95, fontFace: HEAD, fontSize: 52, color: C.text, bold: true, margin: 0 });
  s.addText("Build e testes em containers Docker isolados", {
    x: M + 0.12, y: 3.5, w: 11, h: 0.6, fontFace: HEAD, fontSize: 22, color: C.cyan, margin: 0,
  });
  s.addText("Adaptação de um pipeline Jenkins para executar a compilação dos fontes em um container e a suíte de testes em outro container, totalmente isolados.", {
    x: M + 0.12, y: 4.15, w: 10.6, h: 0.8, fontFace: BODY, fontSize: 14, color: C.muted, margin: 0, lineSpacingMultiple: 1.15,
  });

  // rodapé de capa
  s.addShape(pres.shapes.LINE, { x: M + 0.12, y: 5.55, w: 5.5, h: 0, line: { color: C.line, width: 1 } });
  s.addText([
    t("Daniel Trindade", C.text, { bold: true }), { text: "   ", options: {} },
    t("Trabalho 2 — Jenkins com Docker", C.muted),
  ], { x: M + 0.12, y: 5.7, w: 11, h: 0.34, fontSize: 14, fontFace: BODY, margin: 0 });
  s.addText("Gerência de Configuração · UFAM · 2026", {
    x: M + 0.12, y: 6.05, w: 11, h: 0.34, fontFace: HEAD, fontSize: 11, color: C.muted, margin: 0,
  });
  footer(s, 1);
}

// =====================================================================
// SLIDE 2 — AGENDA
// =====================================================================
async function s2() {
  const s = pres.addSlide(); bg(s);
  header(s, "Roteiro", "O que esta apresentação cobre");
  const items = [
    ["cube", "O projeto e sua arquitetura", "API de conversão de temperatura em Node.js e seus dois métodos"],
    ["vial", "Casos de teste e cobertura", "Suíte de testes e as métricas de cobertura de código"],
    ["diagram", "A mudança: do Trabalho 1 ao 2", "De tudo no agente para dois containers Docker isolados"],
    ["jenkins", "Montar o job no Jenkins", "Criar o Pipeline e configurar a ligação com o GitHub"],
    ["play", "Demonstração dos 4 cenários", "Sucesso, falha de build, instável e o nightly agendado"],
    ["chart", "Métricas e conclusão", "Cobertura, benefícios dos containers e links dos vídeos"],
  ];
  const colW = (W - 2 * M - 0.4) / 2, colH = 1.45, gx = 0.4, gy = 0.25;
  for (let i = 0; i < items.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (colW + gx), y = 1.7 + row * (colH + gy);
    card(s, x, y, colW, colH);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: colH, fill: { color: C.blue }, line: { type: "none" } });
    await iconChip(s, x + 0.28, y + 0.3, items[i][0], C.panel2, C.blue, 0.62);
    s.addText(`0${i + 1}`, { x: x + colW - 1.1, y: y + 0.18, w: 0.95, h: 0.5, fontFace: HEAD, fontSize: 24, color: C.line, bold: true, align: "right", margin: 0 });
    s.addText(items[i][1], { x: x + 1.05, y: y + 0.28, w: colW - 2.0, h: 0.45, fontFace: HEAD, fontSize: 14.5, color: C.text, bold: true, margin: 0, valign: "middle" });
    s.addText(items[i][2], { x: x + 1.05, y: y + 0.78, w: colW - 1.25, h: 0.55, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, lineSpacingMultiple: 1.05 });
  }
  footer(s, 2);
}

// =====================================================================
// SLIDE 3 — VISÃO GERAL DO PROJETO
// =====================================================================
async function s3() {
  const s = pres.addSlide(); bg(s);
  header(s, "O projeto", "API de Conversão de Temperatura");
  // coluna esquerda: descrição
  s.addText("Uma API HTTP minimalista em Node.js, propositalmente simples para manter o foco no pipeline — não na complexidade do código.", {
    x: M, y: 1.7, w: 6.3, h: 0.9, fontFace: BODY, fontSize: 14.5, color: C.text, margin: 0, lineSpacingMultiple: 1.2,
  });
  const facts = [
    ["node", "Node.js 22, sem dependências externas", "Usa apenas módulos nativos; o Scalar (docs) carrega via CDN"],
    ["thermo", "Dois métodos de conversão", "fahrenheitToCelsius e celsiusToFahrenheit"],
    ["server", "Servidor HTTP com endpoints REST", "Rotas de conversão, /openapi.json e /docs interativo"],
  ];
  let y = 2.7;
  for (const [ic, ti, de] of facts) {
    await iconChip(s, M, y, ic, C.panel2, C.cyan, 0.6);
    s.addText(ti, { x: M + 0.78, y: y - 0.04, w: 5.6, h: 0.34, fontFace: HEAD, fontSize: 13.5, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: M + 0.78, y: y + 0.3, w: 5.6, h: 0.5, fontFace: BODY, fontSize: 11.5, color: C.muted, margin: 0, lineSpacingMultiple: 1.05 });
    y += 1.05;
  }
  // coluna direita: endpoints (code)
  card(s, 7.4, 1.7, W - M - 7.4, 4.9, { fill: C.panel });
  s.addText("ENDPOINTS", { x: 7.7, y: 1.9, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 2, bold: true, margin: 0 });
  const ep = [
    ["GET", "/fahrenheit-to-celsius?value=212", "→ 100 °C"],
    ["GET", "/celsius-to-fahrenheit?value=100", "→ 212 °F"],
    ["GET", "/openapi.json", "especificação OpenAPI 3.1"],
    ["GET", "/docs", "UI interativa (Scalar)"],
  ];
  let ey = 2.35;
  for (const [m, path, desc] of ep) {
    pill(s, 7.7, ey, 0.7, m, C.green);
    s.addText(path, { x: 8.5, y: ey, w: 4.2, h: 0.34, fontFace: HEAD, fontSize: 11.5, color: C.text, valign: "middle", margin: 0 });
    s.addText(desc, { x: 8.5, y: ey + 0.32, w: 4.2, h: 0.3, fontFace: BODY, fontSize: 10.5, color: C.muted, margin: 0 });
    ey += 0.92;
  }
  s.addShape(pres.shapes.LINE, { x: 7.7, y: 6.05, w: 4.9, h: 0, line: { color: C.line, width: 1 } });
  s.addText("Resposta em JSON: { input:{scale,value}, output:{scale,value} }", {
    x: 7.7, y: 6.15, w: 5, h: 0.4, fontFace: HEAD, fontSize: 10, color: C.muted, margin: 0,
  });
  footer(s, 3);
}

// =====================================================================
// SLIDE 4 — ARQUITETURA DO CÓDIGO
// =====================================================================
async function s4() {
  const s = pres.addSlide(); bg(s);
  header(s, "Arquitetura do código", "Como os fontes estão organizados");
  // fluxo em camadas (esquerda)
  const layers = [
    ["server.js", "Sobe o servidor HTTP na porta 3000", C.blue],
    ["app.js", "Roteia as requisições e monta as respostas", C.cyan],
    ["conversion-service.js", "Regra de negócio: as duas conversões", C.green],
  ];
  let y = 1.85;
  for (let i = 0; i < layers.length; i++) {
    const [name, desc, col] = layers[i];
    card(s, M, y, 6.2, 1.0, { fill: C.panel });
    s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 0.07, h: 1.0, fill: { color: col }, line: { type: "none" } });
    s.addText(name, { x: M + 0.3, y: y + 0.16, w: 5.7, h: 0.36, fontFace: HEAD, fontSize: 15, color: C.text, bold: true, margin: 0 });
    s.addText(desc, { x: M + 0.3, y: y + 0.55, w: 5.7, h: 0.36, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0 });
    if (i < layers.length - 1)
      s.addImage({ data: await icon("arrow", "#8B949E"), x: M + 2.9, y: y + 1.0, w: 0.3, h: 0.3, rotate: 90 });
    y += 1.25;
  }
  // direita: scripts/test
  card(s, 7.1, 1.85, W - M - 7.1, 4.75, { fill: C.panel });
  s.addText("INFRAESTRUTURA DE QUALIDADE", { x: 7.4, y: 2.05, w: 5.4, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 1.5, bold: true, margin: 0 });
  const infra = [
    ["list", "package.json — scripts", "check, test e test:coverage"],
    ["vial", "test/app.test.js", "Suíte com 9 casos de teste"],
    ["cogs", "scripts/run-coverage.js", "Gera junit.xml + lcov.info"],
    ["branch", "Jenkinsfile", "Pipeline declarativo (build + teste)"],
  ];
  let iy = 2.5;
  for (const [ic, ti, de] of infra) {
    await iconChip(s, 7.4, iy, ic, C.panel2, C.cyan, 0.56);
    s.addText(ti, { x: 8.1, y: iy - 0.04, w: 4.6, h: 0.32, fontFace: HEAD, fontSize: 13, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: 8.1, y: iy + 0.28, w: 4.6, h: 0.3, fontFace: BODY, fontSize: 11, color: C.muted, margin: 0 });
    iy += 1.0;
  }
  footer(s, 4);
}

// =====================================================================
// SLIDE 5 — MÉTODOS E CASOS DE TESTE
// =====================================================================
async function s5() {
  const s = pres.addSlide(); bg(s);
  header(s, "Casos de teste", "Os dois métodos e como são validados");
  // código dos métodos
  codeBox(s, M, 1.75, 6.2, 2.35, [
    t("function ", C.purple), t("fahrenheitToCelsius", C.blue), t("(value) {\n", C.text),
    t("  return ", C.purple), t("round((value - ", C.text), t("32", C.amber), t(") * (", C.text), t("5", C.amber), t("/", C.text), t("9", C.amber), t("));\n", C.text),
    t("}\n\n", C.text),
    t("function ", C.purple), t("celsiusToFahrenheit", C.blue), t("(value) {\n", C.text),
    t("  return ", C.purple), t("round(value * ", C.text), t("9", C.amber), t("/", C.text), t("5", C.amber), t(" + ", C.text), t("32", C.amber), t(");\n", C.text),
    t("}", C.text),
  ], { fontSize: 12.5 });

  // casos de teste (direita)
  s.addText("9 CASOS DE TESTE — DOIS NÚCLEO + 7 DE BORDA", { x: 7.0, y: 1.75, w: 6, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 1, bold: true, margin: 0 });
  const tests = [
    ["32 °F  →  0 °C", "fahrenheitToCelsius(32) === 0", C.green],
    ["0 °C  →  32 °F", "celsiusToFahrenheit(0) === 32", C.green],
    ["212 °F → 100 °C", "endpoint /fahrenheit-to-celsius", C.cyan],
    ["value inválido", "responde HTTP 400", C.amber],
  ];
  let y = 2.2;
  for (const [ti, de, col] of tests) {
    card(s, 7.0, y, W - M - 7.0, 0.78, { fill: C.panel });
    s.addImage({ data: await icon("check", "#3FB950"), x: 7.2, y: y + 0.22, w: 0.34, h: 0.34 });
    s.addText(ti, { x: 7.65, y: y + 0.1, w: 3.0, h: 0.32, fontFace: HEAD, fontSize: 13.5, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: 7.65, y: y + 0.42, w: 4.8, h: 0.3, fontFace: HEAD, fontSize: 10.5, color: C.muted, margin: 0 });
    y += 0.92;
  }
  // faixa inferior
  card(s, M, 4.35, 6.2, 2.25, { fill: C.panel2 });
  await iconChip(s, M + 0.25, 4.6, "chart", C.bg, C.green, 0.6);
  s.addText("Cobertura de código ativada", { x: M + 1.0, y: 4.62, w: 5, h: 0.34, fontFace: HEAD, fontSize: 14, color: C.text, bold: true, margin: 0 });
  s.addText([
    t("npm run test:coverage", C.cyan), t("  executa os testes com\n", C.muted),
    t("--experimental-test-coverage", C.text), t(" e gera os relatórios\n", C.muted),
    t("reports/junit.xml", C.text), t("  (resultado dos testes)  e\n", C.muted),
    t("reports/lcov.info", C.text), t("  (cobertura linha a linha).", C.muted),
  ], { x: M + 0.25, y: 5.25, w: 5.7, h: 1.2, fontFace: BODY, fontSize: 12, margin: 0, lineSpacingMultiple: 1.15 });
  footer(s, 5);
}

// =====================================================================
// SLIDE 6 — ANTES x DEPOIS
// =====================================================================
async function s6() {
  const s = pres.addSlide(); bg(s);
  header(s, "A grande mudança", "Do Trabalho 1 para o Trabalho 2");
  const colW = (W - 2 * M - 0.5) / 2;
  // ANTES
  card(s, M, 1.75, colW, 4.85, { fill: C.panel, line: C.line });
  pill(s, M + 0.3, 2.0, 2.1, "TRABALHO 1", C.muted);
  s.addText("Tudo no agente Jenkins", { x: M + 0.3, y: 2.5, w: colW - 0.6, h: 0.45, fontFace: HEAD, fontSize: 18, color: C.text, bold: true, margin: 0 });
  const before = [
    "O Jenkins roda npm direto na máquina host",
    "Build e teste compartilham o mesmo ambiente",
    "Versão do Node e cache do host influenciam",
    "Sem isolamento entre as etapas",
  ];
  let y = 3.15;
  for (const it of before) {
    s.addImage({ data: await icon("times", "#F85149"), x: M + 0.35, y: y + 0.02, w: 0.28, h: 0.28 });
    s.addText(it, { x: M + 0.78, y: y - 0.04, w: colW - 1.1, h: 0.6, fontFace: BODY, fontSize: 13, color: C.muted, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    y += 0.82;
  }
  // DEPOIS
  const x2 = M + colW + 0.5;
  card(s, x2, 1.75, colW, 4.85, { fill: C.panel, line: C.blue });
  pill(s, x2 + 0.3, 2.0, 2.1, "TRABALHO 2", C.blue);
  s.addText("Containers Docker isolados", { x: x2 + 0.3, y: 2.5, w: colW - 0.6, h: 0.45, fontFace: HEAD, fontSize: 18, color: C.text, bold: true, margin: 0 });
  const after = [
    "Build roda em um container node:22-alpine",
    "Testes rodam em outro container, separado",
    "Ambiente reprodutível e descartável",
    "Cada etapa é um docker run isolado (--rm)",
  ];
  y = 3.15;
  for (const it of after) {
    s.addImage({ data: await icon("check", "#3FB950"), x: x2 + 0.35, y: y + 0.02, w: 0.28, h: 0.28 });
    s.addText(it, { x: x2 + 0.78, y: y - 0.04, w: colW - 1.1, h: 0.6, fontFace: BODY, fontSize: 13, color: C.text, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    y += 0.82;
  }
  footer(s, 6);
}

// =====================================================================
// SLIDE 7 — ARQUITETURA PIPELINE (DIAGRAMA)
// =====================================================================
async function s7() {
  const s = pres.addSlide(); bg(s);
  header(s, "Arquitetura do pipeline", "Como o Jenkins orquestra os dois containers");

  // GitHub
  const boxY = 2.6, boxH = 1.3;
  async function node(x, w, ic, iconColor, title, sub, accent) {
    card(s, x, boxY, w, boxH, { fill: C.panel, line: accent });
    await iconChip(s, x + 0.2, boxY + 0.22, ic, C.panel2, iconColor, 0.55);
    s.addText(title, { x: x + 0.82, y: boxY + 0.2, w: w - 0.95, h: 0.4, fontFace: HEAD, fontSize: 13, color: C.text, bold: true, margin: 0 });
    s.addText(sub, { x: x + 0.82, y: boxY + 0.6, w: w - 0.95, h: 0.55, fontFace: BODY, fontSize: 10.5, color: C.muted, margin: 0, lineSpacingMultiple: 1.0 });
  }
  async function arrow(x, label) {
    s.addImage({ data: await icon("arrow", "#8B949E"), x, y: boxY + boxH / 2 - 0.16, w: 0.32, h: 0.32 });
    if (label) s.addText(label, { x: x - 0.25, y: boxY + boxH / 2 - 0.55, w: 0.85, h: 0.3, fontFace: HEAD, fontSize: 8.5, color: C.cyan, align: "center", margin: 0 });
  }
  await node(M, 2.2, "github", "#FFFFFF", "GitHub", "git push / webhook / cron", C.line);
  await arrow(M + 2.32, "");
  await node(M + 2.75, 2.2, "jenkins", "#D33833", "Jenkins", "lê o Jenkinsfile e orquestra", C.line);
  await arrow(M + 5.07, "");
  // Bloco Docker com dois containers
  const dx = M + 5.5, dw = W - M - dx;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: dx, y: 1.95, w: dw, h: 3.0, rectRadius: 0.1, fill: { color: "0B1220" }, line: { color: C.blue, width: 1.2, dashType: "dash" } });
  s.addText("DOCKER ENGINE", { x: dx + 0.2, y: 2.02, w: 3, h: 0.28, fontFace: HEAD, fontSize: 9.5, color: C.blue, charSpacing: 1, bold: true, margin: 0 });
  s.addText("docker run", { x: dx + dw - 1.5, y: 2.02, w: 1.3, h: 0.28, fontFace: HEAD, fontSize: 9.5, color: C.muted, align: "right", margin: 0 });
  const cw = (dw - 0.9) / 2;
  await node(dx + 0.25, cw, "cube", C.blue, "Container BUILD", "npm run check", C.green);
  s.addImage({ data: await icon("arrow", "#8B949E"), x: dx + 0.25 + cw + 0.05, y: boxY + boxH / 2 - 0.16, w: 0.3, h: 0.3 });
  await node(dx + 0.25 + cw + 0.4, cw, "vial", C.amber, "Container TESTE", "npm run test:coverage", C.amber);
  s.addText("Dois docker run separados; os dois montam o mesmo workspace (-v) e são descartados (--rm).", {
    x: dx + 0.25, y: 4.15, w: dw - 0.5, h: 0.5, fontFace: BODY, fontSize: 11, color: C.muted, italic: true, align: "center", margin: 0,
  });

  // saída: reports
  card(s, M, 5.25, W - 2 * M, 1.25, { fill: C.panel2 });
  await iconChip(s, M + 0.25, 5.5, "chart", C.bg, C.green, 0.62);
  s.addText([
    t("Resultado  ", C.text, { bold: true }),
    t("→  o container de teste gera ", C.muted),
    t("reports/junit.xml", C.text), t(" e ", C.muted), t("reports/lcov.info", C.text),
    t("; o Jenkins publica e decide: ", C.muted),
    t("SUCCESS", C.green, { bold: true }), t(" / ", C.muted),
    t("FAILURE", C.red, { bold: true }), t(" / ", C.muted),
    t("UNSTABLE", C.amber, { bold: true }), t(".", C.muted),
  ], { x: M + 1.05, y: 5.5, w: W - 2 * M - 1.3, h: 0.75, fontFace: BODY, fontSize: 13, margin: 0, valign: "middle", lineSpacingMultiple: 1.1 });
  footer(s, 7);
}

// =====================================================================
// SLIDE 8 — JENKINSFILE EXPLICADO
// =====================================================================
async function s8() {
  const s = pres.addSlide(); bg(s);
  header(s, "O Jenkinsfile", "Um container Docker por etapa");
  codeBox(s, M, 1.75, 7.4, 4.85, [
    t("pipeline {\n", C.text),
    t("  agent ", C.purple), t("any", C.blue), t("   ", C.text), t("// sobe containers via docker run\n", C.muted),
    t("  triggers { ", C.text), t("cron", C.blue), t("(", C.text), t("'* * * * *'", C.green), t(") }  ", C.text), t("// nightly\n\n", C.muted),
    t("  stage(", C.text), t("'Build'", C.green), t(") {\n", C.text),
    t("    bat ", C.purple), t("'docker run --rm -v \"%CD%\":/app -w /app\n", C.green),
    t("         node:22-alpine sh -c\n", C.green),
    t("         \"npm run check\"'\n", C.green),
    t("  }\n\n", C.text),
    t("  stage(", C.text), t("'Test'", C.green), t(") {\n", C.text),
    t("    catchError(", C.text), t("UNSTABLE", C.amber), t(") {\n", C.text),
    t("      bat ", C.purple), t("'docker run --name teste-%BUILD_NUMBER%\n", C.green),
    t("        -v \"%CD%\":/app -e REPORTS_DIR=/tmp/reports\n", C.green),
    t("        node:22-alpine sh -c \"npm run test:coverage\"'\n", C.green),
    t("    }\n", C.text),
    t("    bat ", C.purple), t("'docker cp teste-..:/tmp/reports reports'", C.green), t("  ", C.text), t("// EACCES\n", C.muted),
    t("    junit ", C.blue), t("'reports/junit.xml'", C.green), t("\n", C.text),
    t("  }\n}", C.text),
  ], { fontSize: 11 });

  // anotações à direita
  const notes = [
    ["cube", C.green, "agent any + docker run", "Cada etapa sobe seu próprio container, isolado do outro"],
    ["box", C.blue, "-v \"%CD%\":/app", "Os dois containers montam o mesmo workspace (sem plugin)"],
    ["warn", C.amber, "catchError(UNSTABLE)", "Teste que falha vira build instável, não falha total"],
    ["clock", C.cyan, "triggers { cron }", "Permite o build agendado (nightly) sem clique"],
  ];
  let y = 1.85;
  for (const [ic, col, ti, de] of notes) {
    card(s, 8.2, y, W - M - 8.2, 1.12, { fill: C.panel });
    await iconChip(s, 8.4, y + 0.26, ic, C.panel2, col, 0.56);
    s.addText(ti, { x: 9.1, y: y + 0.18, w: 3.6, h: 0.32, fontFace: HEAD, fontSize: 12.5, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: 9.1, y: y + 0.5, w: 3.55, h: 0.55, fontFace: BODY, fontSize: 11, color: C.muted, margin: 0, lineSpacingMultiple: 1.05 });
    y += 1.24;
  }
  footer(s, 8);
}

// =====================================================================
// SLIDE 9 — PRÉ-REQUISITOS NO JENKINS
// =====================================================================
async function s9() {
  const s = pres.addSlide(); bg(s);
  header(s, "Passo 1 — Pré-requisitos", "O que o Jenkins precisa para falar com o Docker");
  const reqs = [
    ["docker", C.blue, "Docker Desktop", "Instalado e em execução, no modo Linux containers (as imagens node:22-alpine são Linux)."],
    ["terminal", C.cyan, "Docker CLI no Jenkins", "Acessível ao Jenkins (docker --version). Não precisa do plugin Docker Pipeline."],
    ["github", "#FFFFFF", "Plugin Git", "Permite buscar o código do repositório via SCM."],
    ["key", C.amber, "Permissão de Docker", "O usuário do serviço Jenkins precisa conseguir usar o Docker."],
  ];
  const colW = (W - 2 * M - 0.4) / 2;
  for (let i = 0; i < reqs.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (colW + 0.4), y = 1.85 + row * 1.95;
    card(s, x, y, colW, 1.7, { fill: C.panel });
    const [ic, icol, ti, de] = reqs[i];
    await iconChip(s, x + 0.3, y + 0.35, ic, C.panel2, icol, 0.8);
    s.addText(ti, { x: x + 1.35, y: y + 0.32, w: colW - 1.6, h: 0.4, fontFace: HEAD, fontSize: 16, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: x + 1.35, y: y + 0.78, w: colW - 1.6, h: 0.8, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, lineSpacingMultiple: 1.15 });
  }
  // dica
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 5.95, w: W - 2 * M, h: 0.62, rectRadius: 0.08, fill: { color: C.panel2 }, line: { color: C.blue, width: 1 } });
  s.addText([
    t("✓  Validação rápida:  ", C.green, { bold: true }),
    t("docker run --rm node:22-alpine node --version", C.text),
    t("   deve imprimir a versão do Node.", C.muted),
  ], { x: M + 0.3, y: 5.95, w: W - 2 * M - 0.6, h: 0.62, fontFace: HEAD, fontSize: 11.5, valign: "middle", margin: 0 });
  footer(s, 9);
}

// =====================================================================
// SLIDE 10 — MONTAR O JOB
// =====================================================================
async function s10() {
  const s = pres.addSlide(); bg(s);
  header(s, "Passo 2 — Montar o job", "Criar o Pipeline no Jenkins");
  const steps = [
    ["New Item → Pipeline", "Dê um nome (ex.: conversao-temperatura) e escolha o tipo Pipeline."],
    ["Pipeline → Definition", "Selecione \"Pipeline script from SCM\" para o Jenkins ler o Jenkinsfile do repositório."],
    ["SCM → Git", "Aponte a URL do repositório e, se for privado, configure as credenciais."],
    ["Script Path", "Mantenha Jenkinsfile (raiz do projeto). É o arquivo que define build + teste."],
    ["Save → Build Now", "Salve e dispare o primeiro build manualmente para validar."],
  ];
  let y = 1.8;
  for (let i = 0; i < steps.length; i++) {
    const [ti, de] = steps[i];
    // número em círculo
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.62, h: 0.62, fill: { color: C.panel }, line: { color: C.blue, width: 1.5 } });
    s.addText(String(i + 1), { x: M, y, w: 0.62, h: 0.62, fontFace: HEAD, fontSize: 22, color: C.blue, bold: true, align: "center", valign: "middle", margin: 0 });
    if (i < steps.length - 1)
      s.addShape(pres.shapes.LINE, { x: M + 0.31, y: y + 0.62, w: 0, h: 0.36, line: { color: C.line, width: 1.5 } });
    card(s, M + 0.9, y - 0.05, W - 2 * M - 0.9, 0.82, { fill: C.panel });
    s.addText(ti, { x: M + 1.15, y: y + 0.02, w: 4.6, h: 0.7, fontFace: HEAD, fontSize: 15, color: C.text, bold: true, margin: 0, valign: "middle" });
    s.addText(de, { x: M + 5.9, y: y + 0.02, w: W - 2 * M - 6.2, h: 0.7, fontFace: BODY, fontSize: 12, color: C.muted, margin: 0, valign: "middle", lineSpacingMultiple: 1.05 });
    y += 0.98;
  }
  footer(s, 10);
}

// =====================================================================
// SLIDE 11 — LIGAÇÃO COM O GITHUB
// =====================================================================
async function s11() {
  const s = pres.addSlide(); bg(s);
  header(s, "Passo 3 — Ligação com o GitHub", "Configurar o SCM do Pipeline");
  // mock do formulário (esquerda)
  card(s, M, 1.8, 6.6, 4.8, { fill: C.panel });
  s.addText("PIPELINE · SCM", { x: M + 0.3, y: 2.0, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 1.5, bold: true, margin: 0 });
  const fields = [
    ["Repository URL", "https://github.com/DanielTrindade/jenkins-trabalho.git"],
    ["Credentials", "(none) — repositório público"],
    ["Branch Specifier", "*/main   (ou a branch do cenário)"],
    ["Script Path", "Jenkinsfile"],
  ];
  let y = 2.45;
  for (const [label, val] of fields) {
    s.addText(label, { x: M + 0.3, y, w: 6.0, h: 0.28, fontFace: BODY, fontSize: 11, color: C.muted, margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.3, y: y + 0.28, w: 6.0, h: 0.46, rectRadius: 0.05, fill: { color: "0B0F14" }, line: { color: C.line, width: 1 } });
    s.addText(val, { x: M + 0.45, y: y + 0.28, w: 5.7, h: 0.46, fontFace: HEAD, fontSize: 11.5, color: C.text, valign: "middle", margin: 0 });
    y += 1.0;
  }
  // direita: como o gatilho chega
  s.addText("COMO O JENKINS É ACIONADO", { x: 7.5, y: 1.95, w: 5.4, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 1, bold: true, margin: 0 });
  const trg = [
    ["play", C.green, "Manual — Build Now", "Para gravar os cenários sob demanda"],
    ["clock", C.cyan, "Agendado — cron no Jenkinsfile", "O nightly dispara sozinho (Cenário 4)"],
    ["github", "#FFFFFF", "Webhook / Poll SCM", "GitHub avisa o Jenkins a cada push"],
  ];
  let ty = 2.45;
  for (const [ic, col, ti, de] of trg) {
    card(s, 7.5, ty, W - M - 7.5, 1.18, { fill: C.panel });
    await iconChip(s, 7.7, ty + 0.28, ic, C.panel2, col, 0.6);
    s.addText(ti, { x: 8.45, y: ty + 0.2, w: 4.2, h: 0.34, fontFace: HEAD, fontSize: 13, color: C.text, bold: true, margin: 0 });
    s.addText(de, { x: 8.45, y: ty + 0.56, w: 4.2, h: 0.5, fontFace: BODY, fontSize: 11, color: C.muted, margin: 0, lineSpacingMultiple: 1.05 });
    ty += 1.36;
  }
  footer(s, 11);
}

// =====================================================================
// SLIDE 12 — OS 4 CENÁRIOS (OVERVIEW)
// =====================================================================
async function s12() {
  const s = pres.addSlide(); bg(s);
  header(s, "Demonstração", "Os 4 cenários executados no pipeline");
  const rows = [
    ["1", "check", C.green, "Tudo certo", "build e teste passam", "SUCCESS", C.green],
    ["2", "times", C.red, "Deu ruim", "erro de sintaxe no build", "FAILURE", C.red],
    ["3", "warn", C.amber, "Tá instável", "build ok, um teste falha", "UNSTABLE", C.amber],
    ["4", "clock", C.cyan, "O nightly", "cron dispara sozinho", "SUCCESS", C.green],
  ];
  const colW = (W - 2 * M - 0.6) / 2, colH = 1.95;
  for (let i = 0; i < rows.length; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (colW + 0.6), y = 1.85 + row * (colH + 0.3);
    const [num, ic, icol, title, desc, status, scol] = rows[i];
    card(s, x, y, colW, colH, { fill: C.panel, line: C.line });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.08, h: colH, fill: { color: scol }, line: { type: "none" } });
    s.addText(`CENÁRIO ${num}`, { x: x + 0.35, y: y + 0.25, w: 3, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.muted, charSpacing: 1, bold: true, margin: 0 });
    await iconChip(s, x + colW - 1.1, y + 0.25, ic, C.panel2, icol, 0.72);
    s.addText(`"${title}"`, { x: x + 0.35, y: y + 0.58, w: colW - 1.3, h: 0.5, fontFace: HEAD, fontSize: 22, color: C.text, bold: true, margin: 0 });
    s.addText(desc, { x: x + 0.35, y: y + 1.12, w: colW - 1.3, h: 0.4, fontFace: BODY, fontSize: 12.5, color: C.muted, margin: 0 });
    pill(s, x + colW - 1.85, y + colH - 0.55, 1.6, status, scol);
  }
  footer(s, 12);
}

// =====================================================================
// SLIDES 13-16 — CENÁRIOS DETALHADOS
// =====================================================================
async function scenario(n, slideNo, cfg) {
  const s = pres.addSlide(); bg(s);
  header(s, `Cenário ${n} — ${cfg.tag}`, cfg.title);
  // status grande à esquerda
  card(s, M, 1.85, 4.6, 4.75, { fill: C.panel, line: cfg.color });
  await iconChip(s, M + 1.7, 2.25, cfg.icon, C.panel2, cfg.color, 1.2);
  s.addText(cfg.status, { x: M, y: 3.65, w: 4.6, h: 0.6, fontFace: HEAD, fontSize: 30, color: cfg.color, bold: true, align: "center", margin: 0 });
  s.addText(cfg.branch, { x: M + 0.3, y: 4.35, w: 4.0, h: 0.34, fontFace: HEAD, fontSize: 11, color: C.muted, align: "center", margin: 0 });
  // link de vídeo
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.5, y: 5.6, w: 3.6, h: 0.62, rectRadius: 0.31, fill: { color: C.bg }, line: { color: cfg.color, width: 1.25 } });
  s.addImage({ data: await icon("play", "#" + cfg.color), x: M + 0.75, y: 5.74, w: 0.34, h: 0.34 });
  s.addText("[ inserir link do vídeo ]", { x: M + 1.15, y: 5.6, w: 2.9, h: 0.62, fontFace: HEAD, fontSize: 11.5, color: cfg.color, bold: true, valign: "middle", margin: 0 });

  // o que acontece (direita)
  s.addText("O QUE ACONTECE NO PIPELINE", { x: 6.0, y: 1.9, w: 6, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 1, bold: true, margin: 0 });
  let y = 2.35;
  for (const [ic, icol, line] of cfg.steps) {
    s.addImage({ data: await icon(ic, "#" + icol), x: 6.0, y: y + 0.02, w: 0.34, h: 0.34 });
    s.addText(line, { x: 6.5, y: y - 0.06, w: W - M - 6.5, h: 0.55, fontFace: BODY, fontSize: 13.5, color: C.text, margin: 0, valign: "top", lineSpacingMultiple: 1.05 });
    y += 0.78;
  }
  // como provocar (se houver)
  if (cfg.trigger) {
    card(s, 6.0, y + 0.05, W - M - 6.0, 1.25, { fill: C.panel2 });
    s.addText(cfg.triggerLabel || "COMO PROVOCAR", { x: 6.25, y: y + 0.22, w: 5, h: 0.28, fontFace: HEAD, fontSize: 10, color: cfg.color, charSpacing: 1, bold: true, margin: 0 });
    s.addText(cfg.trigger, { x: 6.25, y: y + 0.52, w: W - M - 6.5, h: 0.7, fontFace: HEAD, fontSize: 12, color: C.text, margin: 0, valign: "top", lineSpacingMultiple: 1.1 });
  }
  footer(s, slideNo);
}

// =====================================================================
// SLIDE 17 — COBERTURA DE CÓDIGO
// =====================================================================
async function s17() {
  const s = pres.addSlide(); bg(s);
  header(s, "Métricas", "Cobertura de código com os testes");
  // explicação
  s.addText("A etapa de teste roda dentro do container com a flag de cobertura nativa do Node e emite dois relatórios que o Jenkins publica e arquiva.", {
    x: M, y: 1.75, w: W - 2 * M, h: 0.6, fontFace: BODY, fontSize: 14, color: C.text, margin: 0, lineSpacingMultiple: 1.15,
  });
  // dois cards de relatório
  const colW = (W - 2 * M - 0.5) / 2;
  card(s, M, 2.6, colW, 2.0, { fill: C.panel });
  await iconChip(s, M + 0.3, 2.85, "vial", C.panel2, C.green, 0.7);
  s.addText("reports/junit.xml", { x: M + 1.2, y: 2.85, w: colW - 1.4, h: 0.4, fontFace: HEAD, fontSize: 16, color: C.text, bold: true, margin: 0 });
  s.addText("Resultado de cada caso de teste (passou/falhou). É o que alimenta o gráfico de tendência de testes do Jenkins.", {
    x: M + 0.3, y: 3.65, w: colW - 0.6, h: 0.85, fontFace: BODY, fontSize: 12.5, color: C.muted, margin: 0, lineSpacingMultiple: 1.15 });
  const x2 = M + colW + 0.5;
  card(s, x2, 2.6, colW, 2.0, { fill: C.panel });
  await iconChip(s, x2 + 0.3, 2.85, "chart", C.panel2, C.cyan, 0.7);
  s.addText("reports/lcov.info", { x: x2 + 1.2, y: 2.85, w: colW - 1.4, h: 0.4, fontFace: HEAD, fontSize: 16, color: C.text, bold: true, margin: 0 });
  s.addText("Cobertura linha a linha do código. Pode ser lido por plugins de cobertura ou ferramentas externas (ex.: SonarQube).", {
    x: x2 + 0.3, y: 3.65, w: colW - 0.6, h: 0.85, fontFace: BODY, fontSize: 12.5, color: C.muted, margin: 0, lineSpacingMultiple: 1.15 });
  // faixa de comando
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.85, w: W - 2 * M, h: 1.65, rectRadius: 0.08, fill: { color: "0B0F14" }, line: { color: C.line, width: 1 } });
  s.addText([
    t("$ ", C.green), t("npm run test:coverage\n\n", C.text),
    t("ℹ tests 9   ℹ pass 9   ℹ fail 0\n", C.cyan),
    t("# duration_ms ...   ", C.muted), t("✓ junit.xml + lcov.info gerados", C.green),
  ], { x: M + 0.35, y: 5.05, w: W - 2 * M - 0.7, h: 1.3, fontFace: HEAD, fontSize: 13, margin: 0, valign: "top", lineSpacingMultiple: 1.15 });
  footer(s, 17);
}

// =====================================================================
// SLIDE 18 — CONCLUSÃO + LINKS
// =====================================================================
async function s18() {
  const s = pres.addSlide(); bg(s);
  // fundo de fechamento, mais "premium"
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.35, y: 0.35, w: W - 0.7, h: H - 0.7, rectRadius: 0.12, fill: { type: "none" }, line: { color: C.line, width: 1 } });
  s.addText("CONCLUSÃO", { x: M + 0.1, y: 0.7, w: 8, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.blue, charSpacing: 3, bold: true, margin: 0 });
  s.addText("Por que mover build e teste para containers", {
    x: M + 0.05, y: 1.0, w: W - 1.4, h: 0.7, fontFace: HEAD, fontSize: 26, color: C.text, bold: true, margin: 0 });
  const benefits = [
    ["cube", "Isolamento real", "Build e teste não compartilham ambiente nem efeitos colaterais"],
    ["layer", "Reprodutibilidade", "A mesma imagem node:22-alpine roda igual em qualquer máquina"],
    ["box", "Paridade dev/CI", "Os comandos do pipeline rodam idênticos no docker run local"],
  ];
  const colW = (W - 2 * M - 0.8) / 3;
  for (let i = 0; i < benefits.length; i++) {
    const x = M + i * (colW + 0.4), y = 2.0;
    card(s, x, y, colW, 1.7, { fill: C.panel });
    await iconChip(s, x + 0.3, y + 0.3, benefits[i][0], C.panel2, C.blue, 0.66);
    s.addText(benefits[i][1], { x: x + 1.1, y: y + 0.38, w: colW - 1.3, h: 0.5, fontFace: HEAD, fontSize: 14, color: C.text, bold: true, margin: 0, valign: "middle" });
    s.addText(benefits[i][2], { x: x + 0.3, y: y + 1.08, w: colW - 0.6, h: 0.55, fontFace: BODY, fontSize: 11.5, color: C.muted, margin: 0, lineSpacingMultiple: 1.08 });
  }
  // links
  card(s, M, 4.0, W - 2 * M, 2.05, { fill: C.panel2 });
  s.addText("LINKS", { x: M + 0.35, y: 4.2, w: 5, h: 0.3, fontFace: HEAD, fontSize: 11, color: C.blue, charSpacing: 2, bold: true, margin: 0 });
  await iconChip(s, M + 0.35, 4.6, "github", C.bg, "#FFFFFF", 0.6);
  s.addText("Repositório", { x: M + 1.1, y: 4.55, w: 3, h: 0.3, fontFace: HEAD, fontSize: 13, color: C.text, bold: true, margin: 0 });
  s.addText("github.com/DanielTrindade/jenkins-trabalho", { x: M + 1.1, y: 4.85, w: 6, h: 0.34, fontFace: HEAD, fontSize: 12, color: C.cyan, margin: 0 });
  await iconChip(s, M + 0.35, 5.45, "play", C.bg, C.green, 0.6);
  s.addText("Vídeos dos cenários", { x: M + 1.1, y: 5.4, w: 4, h: 0.3, fontFace: HEAD, fontSize: 13, color: C.text, bold: true, margin: 0 });
  s.addText("[ inserir os links dos 4 vídeos — um por cenário ]", { x: M + 1.1, y: 5.7, w: 7, h: 0.34, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });

  s.addText("Daniel Trindade · Gerência de Configuração · UFAM · 2026", {
    x: M, y: 6.35, w: W - 2 * M, h: 0.34, fontFace: HEAD, fontSize: 11, color: C.muted, align: "center", margin: 0 });
  footer(s, 18);
}

// =====================================================================
(async () => {
  await s1(); await s2(); await s3(); await s4(); await s5(); await s6();
  await s7(); await s8(); await s9(); await s10(); await s11(); await s12();
  await scenario(1, 13, {
    tag: "tudo certo!", title: "Build e testes com sucesso", status: "SUCCESS", color: C.green,
    icon: "check", branch: "branch: conversion-cenario-build-sucesso",
    steps: [
      ["cube", "2496ED", "1º docker run: container de BUILD valida a sintaxe (npm run check)"],
      ["box", "3FB950", "Os fontes ficam no workspace, montado nos dois containers (-v)"],
      ["vial", "D29922", "2º docker run: container de TESTE (outro hostname) roda os testes"],
      ["check", "3FB950", "9 testes passam → JUnit publicado, build verde"],
    ],
  });
  await scenario(2, 14, {
    tag: "deu ruim!", title: "Falha durante a compilação", status: "FAILURE", color: C.red,
    icon: "times", branch: "branch: conversion-cenario-falha-sintaxe",
    steps: [
      ["cube", "2496ED", "Container de BUILD sobe e roda npm run check"],
      ["times", "F85149", "Erro de sintaxe nos fontes → o check falha"],
      ["warn", "D29922", "Stage de teste é pulado: o 2º container nem sobe"],
      ["times", "F85149", "Jenkins marca o build como FAILURE"],
    ],
    trigger: "Em src/app.js, quebrar uma desestruturação: const { pathname = requestUrl;",
  });
  await scenario(3, 15, {
    tag: "tá instável!", title: "Build ok, mas um teste falha", status: "UNSTABLE", color: C.amber,
    icon: "warn", branch: "branch: conversion-cenario-testes-falhando",
    steps: [
      ["cube", "3FB950", "Container de BUILD passa normalmente (npm run check ok)"],
      ["vial", "D29922", "Container de TESTE roda os testes e um caso falha"],
      ["warn", "D29922", "catchError(UNSTABLE) captura a falha sem abortar"],
      ["chart", "3FB950", "JUnit é publicado mesmo assim → build UNSTABLE"],
    ],
    trigger: "Em conversion-service.js, alterar a fórmula: (value - 32) * (4 / 9).",
  });
  await scenario(4, 16, {
    tag: "o lendário nightly", title: "Build agendada, sem intervenção", status: "SUCCESS", color: C.cyan,
    icon: "clock", branch: "branch: conversion-cenario-build-agendado",
    steps: [
      ["clock", "39C5CF", "O gatilho cron('* * * * *') dispara o job sozinho"],
      ["cube", "2496ED", "Mesmo fluxo: container de build → container de teste"],
      ["check", "3FB950", "Build e testes executam com sucesso, sem clicar em nada"],
      ["gear", "8B949E", "Em produção, o cron voltaria para algo como 'H 8 * * 1-5'"],
    ],
    triggerLabel: "DICA",
    trigger: "Salve o job uma vez para o Jenkins registrar o agendamento.",
  });
  await s17(); await s18();
  await pres.writeFile({ fileName: "slides/jenkins-docker.pptx" });
  console.log("OK -> slides/jenkins-docker.pptx");
})();
