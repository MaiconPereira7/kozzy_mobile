// maiconpereira7/kozzy_mobile/server.js

// ... (Mantenha as suas importações e a rota de login existentes)

// --- ROTA DO CHATBOT ---
app.post('/chatbot', async (req, res) => {
  const { message } = req.body;
  const msg = message ? message.toLowerCase() : "";
  let reply = "";

  if (msg.includes("olá") || msg.includes("oi")) {
    reply = "Olá! Eu sou o assistente virtual da Kozzy. Como posso ajudar com os seus pedidos hoje?";
  } else if (msg.includes("ticket") || msg.includes("problema") || msg.includes("ajuda")) {
    reply = "Entendido. Posso abrir um ticket de suporte para si. Por favor, descreva o problema.";
  } else if (msg.includes("atendente") || msg.includes("humano")) {
    reply = "Estou a transferir a sua solicitação para um dos nossos consultores. Aguarde um momento.";
  } else {
    reply = "Desculpe, não entendi. Tente dizer 'Abrir Ticket' ou 'Falar com Atendente'.";
  }

  res.json({
    id: Date.now().toString(),
    text: reply,
    sender: 'bot'
  });
});

// Certifique-se de que o servidor ouve em 0.0.0.0 para acesso mobile
app.listen(3000, '0.0.0.0', () => console.log('🚀 SERVIDOR KOZZY RODANDO!'));