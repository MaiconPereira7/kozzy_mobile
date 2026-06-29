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
  timeout: 12_000, // 12s por tentativa — garante que 3 modelos cabem nos 45s do app
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

// Modelos de chat preferidos — NÃO incluir code/safety/reasoning especializados
const PREFERRED = [
  'cohere/north-mini-code:free',
  'qwen/qwen3-8b:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'deepseek/deepseek-chat:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

// Padrões de modelos especializados que NÃO servem para chat
const UNSUITABLE = ['content-safety', 'content-filter', 'code:', 'north-mini-code', 'reasoning', 'poolside', 'nemotron'];
const isChatModel = (id) => !UNSUITABLE.some(p => id.includes(p));

// Blacklist: modelos que deram 429 ficam bloqueados por 5 minutos
const blacklist = new Map();
const BLACKLIST_TTL = 5 * 60 * 1000;
const isBlacklisted = (model) => {
  const ts = blacklist.get(model);
  if (!ts) return false;
  if (Date.now() - ts > BLACKLIST_TTL) { blacklist.delete(model); return false; }
  return true;
};

let models = [];
let modelIdx = 0;

async function loadModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    });
    const { data } = await res.json();
    const freeIds = (data ?? [])
      .filter(m => m.id.endsWith(':free') && isChatModel(m.id))
      .map(m => m.id);
    const freeSet = new Set(freeIds);
    const preferred = PREFERRED.filter(m => freeSet.has(m));
    const others = freeIds.filter(m => !PREFERRED.includes(m));
    models = [...preferred, ...others];
    modelIdx = 0;
    console.log(`✅ ${models.length} modelos de chat gratuitos encontrados`);
    if (models.length > 0) console.log(`🤖 Usando: ${models[0]}`);
    else console.warn('⚠️ Nenhum modelo encontrado!');
  } catch (err) {
    console.error('Erro ao carregar modelos:', err.message);
    models = PREFERRED;
  }
}

async function callAI(messages) {
  if (models.length === 0) await loadModels();

  for (let attempt = 0; attempt < models.length; attempt++) {
    const model = models[modelIdx];

    if (isBlacklisted(model)) {
      modelIdx = (modelIdx + 1) % models.length;
      continue;
    }

    try {
      const completion = await client.chat.completions.create({ model, messages });
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('Resposta vazia');
      // Sucesso: mantém modelIdx no modelo que funcionou
      console.log(`✅ Resposta ok (${model})`);
      return { text, model };
    } catch (err) {
      if (err.status === 429) {
        blacklist.set(model, Date.now());
        console.warn(`⛔ ${model} → 429, bloqueado por 5 min`);
      } else {
        console.warn(`⚠️ ${model} falhou (${err.status ?? '?'}) — próximo...`);
      }
      modelIdx = (modelIdx + 1) % models.length; // avança só na falha
    }
  }
  throw new Error('Todos os modelos disponíveis falharam. Tente em alguns minutos.');
}

app.post('/chat', async (req, res) => {
  try {
    if (!req.body?.message) {
      return res.status(400).json({ message: 'Mensagem vazia!' });
    }
    const { message, userName = 'Cliente', history = [] } = req.body;
    console.log(`💬 [${userName}]: ${message}`);

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nO cliente se chama ${userName}.` },
      ...history,
      { role: 'user', content: message },
    ];

    const { text } = await callAI(messages);

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
