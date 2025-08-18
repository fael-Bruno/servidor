const WebSocket = require("ws");
const fetch = require("node-fetch");

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

let clients = new Set();

// Função para buscar tabela do Brasileirão (TheSportsDB)
async function getTabela() {
  try {
    // Série A Brasil (ID 4328 na TheSportsDB)
    const res = await fetch("https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328&s=2024-2025");
    const data = await res.json();
    return data.table || [];
  } catch (err) {
    console.error("Erro ao buscar tabela:", err);
    return [];
  }
}

// Envia dados atualizados (online + tabela) para todos os clientes
async function broadcast() {
  const tabela = await getTabela();
  const payload = JSON.stringify({ online: clients.size, tabela });

  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("Novo cliente conectado. Total:", clients.size);

  // Envia dados assim que conecta
  broadcast();

  ws.on("close", () => {
    clients.delete(ws);
    console.log("Cliente saiu. Total:", clients.size);
    broadcast();
  });
});

// Atualiza todo mundo a cada 60 segundos
setInterval(broadcast, 60000);

console.log("Servidor WebSocket rodando na porta " + PORT);
