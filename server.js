const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });
let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  broadcast();

  ws.on("close", () => {
    clients.delete(ws);
    broadcast();
  });
});

function broadcast() {
  const online = clients.size;
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ online }));
    }
  }
}

console.log("Servidor WebSocket rodando na porta 8080");
