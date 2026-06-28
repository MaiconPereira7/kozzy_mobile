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
  console.error('❌ ERRO: OPENROUTER_API_KEY não encontrada no .env!');
  process.exit(1);
}

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `Você é a Kozzy, assistente virtual da Kozzy Alimentos. Seu principal objetivo é ajudar clientes e abrir tickets de suporte quando necessário.

Quando o cliente mencionar qualquer problema (entrega atrasada, produto com defeito, dúvida em fatura, etc.), conduza uma conversa natural para coletar:
1. Assunto — resumo curto do problema (máx 80 caracteres)
2. Categoria — uma de: Entrega, Faturamento, Produto, Comercial, Suporte TI, Outro
3. Descrição — detalhes do problema

Faça as perguntas de forma natural, uma ou duas por vez. NÃO pergunte sobre prioridade — isso é definido internamente pela equipe.
Quando tiver as 3 informações coletadas, responda EXATAMENTE assim (sem nada antes do marcador):

KOZZY_TICKET:{"subject":"...","category":"...","description":"..."}
Sua mensagem amigável confirmando que o ticket será registrado e a equipe entrará em contato.

Regras importantes:
- Só emita KOZZY_TICKET quando tiver as 3 informações completas
- Nunca mencione prioridade ao cliente
- Se o cliente não quiser abrir ticket, apenas ajude normalmente
- Responda sempre em português brasileiro
- Seja breve e amigável`;

// Preferência de modelos — testa nessa ordem
const PREFERRED = [
  'qwen/qwen3-8b:free',
  'google/gemma-3-27b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-chat:free',
  'deepseek/deepseek-r1:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'microsoft/phi-3-mini-128k-instruct:free',
];

let models = [];     // lista de modelos disponíveis agora
let modelIdx = 0;    // índice do modelo atual

async function loadModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    });
    const { data } = await res.json();
    const freeSet = new Set(
      (data ?? []).filter(m => m.id.endsWith(':free')).map(m => m.id)
    );
    // Preferred first, then any other free model
    const preferred = PREFERRED.filter(m => freeSet.has(m));
    const others = [...freeSet].filter(m => !PREFERRED.includes(m));
    models = [...preferred, ...others];
    modelIdx = 0;
    console.log(`✅ ${models.length} modelos gratuitos encontrados`);
    if (models.length > 0) console.log(`🤖 Iniciando com: ${models[0]}`);
    else console.warn('⚠️ Nenhum modelo gratuito encontrado no OpenRouter!');
  } catch (err) {
    console.error('Erro ao carregar modelos:', err.message);
    models = PREFERRED; // fallback estático
  }
}

async function callAI(messages) {
  if (models.length === 0) await loadModels();

  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[modelIdx];
    try {
      const completion = await client.chat.completions.create({ model, messages });
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('Resposta vazia');
      return { text, model };
    } catch (err) {
      const code = err.status ?? err.code ?? '?';
      console.warn(`⚠️ ${model} falhou (${code}) — tentando próximo...`);
      modelIdx = (modelIdx + 1) % models.length;
    }
  }
  throw new Error('Todos os modelos gratuitos estão indisponíveis agora. Tente em alguns minutos.');
}

app.post('/chat', async (req, res) => {
  try {
    if (!req.body?.message) {
      return res.status(400).json({ message: 'Mensagem vazia!' });
    }
    const { message, userName = 'Cliente' } = req.body;
    console.log(`💬 [${userName}]: ${message}`);

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nO cliente se chama ${userName}.` },
      { role: 'user', content: message },
    ];

    const { text, model } = await callAI(messages);
    console.log(`✅ Resposta ok (${model})`);

    // Detecta se a IA quer criar um ticket
    const ticketMatch = text.match(/KOZZY_TICKET:(\{[^}]+\})/s);
    if (ticketMatch) {
      try {
        const ticketData = JSON.parse(ticketMatch[1]);
        const cleanText = text.replace(/KOZZY_TICKET:\{[^}]+\}\s*/s, '').trim();
        console.log(`🎫 Ticket detectado:`, ticketData);
        return res.json({ response: cleanText, createTicket: ticketData });
      } catch {
        // JSON inválido — trata como resposta normal
      }
    }

    res.json({ response: text });

  } catch (error) {
    const msg = error?.message ?? String(error);
    console.error('❌', msg);
    res.status(500).json({ message: msg });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', activeModel: models[modelIdx] ?? 'nenhum' });
});

app.listen(3000, async () => {
  console.log('🚀 Servidor Kozzy rodando em http://localhost:3000');
  await loadModels();
});
