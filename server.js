// Rota do Chatbot Kozzy
app.post('/chatbot', async (req, res) => {
  const { message } = req.body;
  const msg = message.toLowerCase();
  let reply = "";

  if (msg.includes("olá") || msg.includes("oi")) {
    reply = "Olá! Como posso ajudar você com seus pedidos Kozzy hoje?";
  } else if (msg.includes("ticket") || msg.includes("problema")) {
    reply = "Sinto muito por isso. Posso abrir um chamado para você? Digite o motivo.";
  } else if (msg.includes("vendedor") || msg.includes("humano")) {
    reply = "Estou te transferindo para um consultor. Por favor, aguarde na linha.";
  } else {
    reply = "Não entendi muito bem. Você quer 'Abrir um Ticket' ou 'Ver Status do Pedido'?";
  }

  res.json({
    id: Date.now().toString(),
    text: reply,
    sender: 'bot'
  });
});