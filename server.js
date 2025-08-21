const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  broadcast({ type: "online", online: clients.size });

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg.toString());
      if (data.type === "chat") {
        broadcast({ type: "chat", name: data.name, message: data.message });
      }
    } catch (e) {
      console.error("Erro ao processar mensagem:", e);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    broadcast({ type: "online", online: clients.size });
  });
});

function broadcast(data) {
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }
}

console.log("Servidor WebSocket rodando na porta " + PORT);
