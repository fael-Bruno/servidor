const http = require("http");
const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;

// cria servidor HTTP vazio (necessário pro Render)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Servidor WebSocket rodando");
});

const wss = new WebSocket.Server({ server });

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

server.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
