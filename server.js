const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

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

console.log("Servidor WebSocket rodando na porta " + PORT);
