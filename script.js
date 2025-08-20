ws.onmessage = (event) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (e) {
    console.error("Mensagem inválida recebida:", event.data);
    return;
  }

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
