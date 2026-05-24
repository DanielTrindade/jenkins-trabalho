const { createApp } = require("./app");

const port = Number(process.env.PORT ?? 3000);
const { server } = createApp();

server.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});

