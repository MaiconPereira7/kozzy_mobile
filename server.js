require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.error('❌ ERRO: Chave OPENROUTER_API_KEY não encontrada no .env!');
  process.exit(1);
}

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
});

app.post('/chat', async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ error: 'Mensagem vazia!' });
    }

    const { message, userName = 'Cliente' } = req.body;
    console.log(`💬 Mensagem de ${userName}: ${message}`);

    const completion = await client.chat.completions.create({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
        {
          role: 'system',
          content: `Você é a Kozzy, assistente virtual da Kozzy Alimentos.
Sua função é ajudar clientes com dúvidas sobre pedidos, entregas, produtos e suporte.
Responda sempre em português brasileiro, de forma amigável, objetiva e profissional.
Quando o cliente tiver um problema com pedido, sugira abrir um ticket de suporte.
O cliente se chama ${userName}.`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? 'Desculpe, não consegui processar sua mensagem.';
    console.log(`✅ Resposta enviada para ${userName}`);
    res.json({ response: text });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({
      error: 'Erro interno ao processar a IA. Tente novamente.',
      details: error.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor Kozzy funcionando!' });
});

app.listen(3000, () => {
  console.log('🚀 Servidor Kozzy rodando em http://localhost:3000');
  console.log('🤖 IA: Llama 3.3 via OpenRouter (gratuito)');
});