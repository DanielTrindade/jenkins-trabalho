const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { setMaxListeners } = require("node:events");

// Diretorio de saida dos relatorios. No CI com Docker apontamos para uma pasta
// dentro do proprio container (ex.: /tmp/reports) via REPORTS_DIR, para nao
// depender de escrita no volume montado do host.
const outDir = process.env.REPORTS_DIR || "reports";
fs.mkdirSync(outDir, { recursive: true });
setMaxListeners(0);

const child = spawn(
  process.execPath,
  [
    "--test",
    "--experimental-test-coverage",
    "--test-reporter=spec",
    "--test-reporter=junit",
    "--test-reporter=lcov",
    "--test-reporter-destination=stdout",
    "--test-reporter-destination=" + path.join(outDir, "junit.xml"),
    "--test-reporter-destination=" + path.join(outDir, "lcov.info")
  ],
  {
    stdio: "inherit"
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
