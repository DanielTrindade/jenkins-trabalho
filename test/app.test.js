const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../src/app");
const {
  fahrenheitToCelsius,
  celsiusToFahrenheit
} = require("../src/conversion-service");

function startTestServer() {
  const { server } = createApp();

  return new Promise((resolve) => {
    server.listen(0, "localhost", () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://localhost:${address.port}`
      });
    });
  });
}

function stopTestServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function requestJson(baseUrl, path, options = {}) {
  const requestBody = options.body ? JSON.stringify(options.body) : null;

  return new Promise((resolve, reject) => {
    const request = http.request(
      `${baseUrl}${path}`,
      {
        method: options.method ?? "GET",
        headers: requestBody
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(requestBody)
            }
          : undefined
      },
      (response) => {
        let rawBody = "";

        response.on("data", (chunk) => {
          rawBody += chunk;
        });

        response.on("end", () => {
          const contentType = response.headers["content-type"] ?? "";
          const body = rawBody && contentType.includes("application/json")
            ? JSON.parse(rawBody)
            : rawBody;

          resolve({
            statusCode: response.statusCode,
            body
          });
        });
      }
    );

    request.on("error", reject);

    if (requestBody) {
      request.write(requestBody);
    }

    request.end();
  });
}

test("fahrenheitToCelsius deve converter 32F para 0C", () => {
  assert.equal(fahrenheitToCelsius(32), 0);
});

test("celsiusToFahrenheit deve converter 0C para 32F", () => {
  assert.equal(celsiusToFahrenheit(0), 32);
});

test("GET /fahrenheit-to-celsius deve converter corretamente", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/fahrenheit-to-celsius?value=212");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      input: {
        scale: "F",
        value: 212
      },
      output: {
        scale: "C",
        value: 100
      }
    });
  } finally {
    await stopTestServer(server);
  }
});

test("GET /celsius-to-fahrenheit deve converter corretamente", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/celsius-to-fahrenheit?value=37.5");

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
      input: {
        scale: "C",
        value: 37.5
      },
      output: {
        scale: "F",
        value: 99.5
      }
    });
  } finally {
    await stopTestServer(server);
  }
});

test("GET /openapi.json deve expor a especificação da API", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/openapi.json");

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.openapi, "3.1.0");
    assert.equal(response.body.info.title, "Temperature Converter API");
    assert.ok(response.body.paths["/fahrenheit-to-celsius"]);
    assert.ok(response.body.paths["/celsius-to-fahrenheit"]);
  } finally {
    await stopTestServer(server);
  }
});

test("GET /docs deve servir a página HTML do Scalar", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/docs");

    assert.equal(response.statusCode, 200);
    assert.match(response.body, /@scalar\/api-reference/);
    assert.match(response.body, /\/openapi\.json/);
  } finally {
    await stopTestServer(server);
  }
});

test("GET /fahrenheit-to-celsius deve validar o parâmetro value", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/fahrenheit-to-celsius?value=abc");

    assert.equal(response.statusCode, 400);
    assert.deepEqual(response.body, {
      message: "O parâmetro 'value' deve ser numérico."
    });
  } finally {
    await stopTestServer(server);
  }
});

test("POST em endpoint de conversão deve retornar método não permitido", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/celsius-to-fahrenheit?value=10", {
      method: "POST"
    });

    assert.equal(response.statusCode, 405);
    assert.deepEqual(response.body, { message: "Método não permitido." });
  } finally {
    await stopTestServer(server);
  }
});

test("rotas desconhecidas devem retornar 404", async () => {
  const { server, baseUrl } = await startTestServer();

  try {
    const response = await requestJson(baseUrl, "/health");

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.body, { message: "Rota não encontrada." });
  } finally {
    await stopTestServer(server);
  }
});
