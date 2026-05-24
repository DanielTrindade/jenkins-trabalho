const http = require("node:http");
const { URL } = require("node:url");
const {
  fahrenheitToCelsius,
  celsiusToFahrenheit
} = require("./conversion-service");

function getOpenApiDocument(baseUrl) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Temperature Converter API",
      version: "1.0.0",
      description: "API simples com dois endpoints de conversão de temperatura."
    },
    servers: [
      {
        url: baseUrl,
        description: "Servidor atual"
      }
    ],
    tags: [
      {
        name: "Conversion",
        description: "Conversões de temperatura"
      }
    ],
    paths: {
      "/fahrenheit-to-celsius": {
        get: {
          tags: ["Conversion"],
          summary: "Converte Fahrenheit para Celsius",
          parameters: [
            {
              name: "value",
              in: "query",
              required: true,
              schema: {
                type: "number"
              }
            }
          ],
          responses: {
            200: {
              description: "Conversão realizada com sucesso"
            },
            400: {
              description: "Parâmetro inválido"
            }
          }
        }
      },
      "/celsius-to-fahrenheit": {
        get: {
          tags: ["Conversion"],
          summary: "Converte Celsius para Fahrenheit",
          parameters: [
            {
              name: "value",
              in: "query",
              required: true,
              schema: {
                type: "number"
              }
            }
          ],
          responses: {
            200: {
              description: "Conversão realizada com sucesso"
            },
            400: {
              description: "Parâmetro inválido"
            }
          }
        }
      }
    }
  };
}

function renderScalarPage() {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Temperature Converter API Docs</title>
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference("#app", {
        url: "/openapi.json",
        theme: "saturn",
        layout: "modern",
        darkMode: false
      });
    </script>
  </body>
</html>`;
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });

  response.end(body);
}

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(html)
  });

  response.end(html);
}

function readTemperatureValue(requestUrl) {
  const rawValue = requestUrl.searchParams.get("value");

  if (rawValue === null || rawValue.trim() === "") {
    throw new Error("O parâmetro 'value' é obrigatório.");
  }

  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    throw new Error("O parâmetro 'value' deve ser numérico.");
  }

  return numericValue;
}

function createTemperatureResponse(inputScale, outputScale, inputValue, outputValue) {
  return {
    input: {
      scale: inputScale,
      value: inputValue
    },
    output: {
      scale: outputScale,
      value: outputValue
    }
  };
}

function createApp() {
  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url, "http://localhost");
    const { pathname } = requestUrl;
    const method = request.method ?? "GET";
    const baseUrl = `${requestUrl.protocol}//${request.headers.host ?? "localhost"}`;

    try {
      if (method === "GET" && pathname === "/docs") {
        sendHtml(response, 200, renderScalarPage());
        return;
      }

      if (method === "GET" && pathname === "/openapi.json") {
        sendJson(response, 200, getOpenApiDocument(baseUrl));
        return;
      }

      if (method === "GET" && pathname === "/fahrenheit-to-celsius") {
        const value = readTemperatureValue(requestUrl);

        sendJson(
          response,
          200,
          createTemperatureResponse("F", "C", value, fahrenheitToCelsius(value))
        );
        return;
      }

      if (method === "GET" && pathname === "/celsius-to-fahrenheit") {
        const value = readTemperatureValue(requestUrl);

        sendJson(
          response,
          200,
          createTemperatureResponse("C", "F", value, celsiusToFahrenheit(value))
        );
        return;
      }

      if (pathname === "/fahrenheit-to-celsius" || pathname === "/celsius-to-fahrenheit") {
        sendJson(response, 405, { message: "Método não permitido." });
        return;
      }

      sendJson(response, 404, { message: "Rota não encontrada." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro interno.";
      const statusCode = message.includes("parâmetro 'value'") ? 400 : 500;
      sendJson(response, statusCode, { message });
    }
  });

  return { server };
}

module.exports = {
  createApp
};
