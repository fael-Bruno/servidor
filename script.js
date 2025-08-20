// === Chat em tempo real (Render) ===
const onlineCountEl = document.getElementById("online-count");
const chatMessages = document.querySelector("#chat-box .chat-messages");
const chatInput = document.getElementById("chat-input");

// Pergunta nome do usuário
let username = localStorage.getItem("chat-username");
if (!username) {
  username = prompt("Digite seu nome para usar no chat:") || "Anônimo";
  localStorage.setItem("chat-username", username);
}

// Conecta ao servidor WebSocket
const ws = new WebSocket("wss://servidor-jizn.onrender.com");

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Atualiza online
  if (data.online !== undefined) {
    onlineCountEl.textContent = data.online;
    return;
  }

  // Mensagem de chat
  if (data.user && data.text) {
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
};

// Enviar mensagem
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && chatInput.value.trim() !== "") {
    const message = {
      user: username,
      text: chatInput.value.trim()
    };
    ws.send(JSON.stringify(message));
    chatInput.value = "";
  }
});
