// maiconpereira7/kozzy_mobile/server.js

// ... (mantenha seu código de conexão e login anterior)

// --- NOVA ROTA DO CHATBOT ---
app.post('/chatbot', async (req, res) => {
  const { message } = req.body;
  const msg = message ? message.toLowerCase() : "";
  let reply = "";

  // Lógica de respostas por palavras-chave
  if (msg.includes("olá") || msg.includes("oi")) {
    reply = "Olá! Eu sou o assistente virtual da Kozzy. Como posso ajudar com seus pedidos hoje?";
  } else if (msg.includes("ticket") || msg.includes("problema") || msg.includes("ajuda")) {
    reply = "Entendido. Posso abrir um ticket de suporte para você. Por favor, descreva o problema detalhadamente.";
  } else if (msg.includes("atendente") || msg.includes("humano")) {
    reply = "Estou transferindo sua solicitação para um de nossos consultores. Aguarde um momento, por favor.";
  } else {
    reply = "Desculpe, ainda estou aprendendo. Tente dizer 'Abrir Ticket' ou 'Falar com Atendente'.";
  }

  res.json({
    id: Date.now().toString(),
    text: reply,
    sender: 'bot',
    timestamp: new Date()
  });
});

// Mantenha o app.listen no final
app.listen(3000, '0.0.0.0', () => console.log('🚀 SERVIDOR RODANDO!'));