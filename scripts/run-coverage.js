const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { setMaxListeners } = require("node:events");

fs.mkdirSync("reports", { recursive: true });
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
    "--test-reporter-destination=reports/junit.xml",
    "--test-reporter-destination=reports/lcov.info"
  ],
  {
    stdio: "inherit"
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
