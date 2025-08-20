const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  broadcastOnline();

  ws.on("message", (msg) => {
    // repassa mensagem para todos
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcastOnline();
  });
});

function broadcastOnline() {
  const online = clients.size;
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ online }));
    }
  }
}

console.log("Servidor WebSocket rodando na porta " + PORT);
