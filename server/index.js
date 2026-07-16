require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const { optionalAuth } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// ─── MongoDB ──────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
  console.warn('⚠️  MONGODB_URI não configurada ou com placeholder — rodando sem banco de dados');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB conectado'))
    .catch(err => console.error('❌ Erro ao conectar MongoDB:', err.message));
}

const ticketSchema = new mongoose.Schema({
  protocol:    { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  subject:     { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String, required: true },
  status:      { type: String, default: 'open', enum: ['open', 'inProgress', 'closed'] },
  priority:    { type: String, default: 'medium', enum: ['low', 'medium', 'high', 'critical'] },
  clientType:  { type: String, default: 'retail' },
  responses:   [{ id: String, text: String, author: String, authorRole: String, createdAt: String }],
  rating:      { stars: Number, comment: String },
  createdAt:   { type: String, default: () => new Date().toISOString() },
  updatedAt:   { type: String, default: () => new Date().toISOString() },
});

const TicketModel = mongoose.model('Ticket', ticketSchema);
const dbReady = () => mongoose.connection.readyState === 1;

// ─── Endpoints de Tickets ─────────────────────────────────────────────────────

function generateProtocol() {
  return `KZY${Date.now().toString().slice(-6)}`;
}

app.get('/tickets', async (_req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    res.json(await TicketModel.find().sort({ createdAt: -1 }).lean());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/tickets/mine/:name', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    res.json(await TicketModel.find({ name: req.params.name }).sort({ createdAt: -1 }).lean());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/tickets', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    const { name, subject, category, description, clientType, priority } = req.body;
    if (!name || !subject || !category || !description) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando' });
    }
    const ticket = await TicketModel.create({
      protocol: generateProtocol(), name, subject, category, description,
      clientType: clientType ?? 'retail', priority: priority ?? 'medium',
    });
    console.log(`🎫 Ticket criado: ${ticket.protocol} — ${subject}`);
    res.status(201).json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/tickets/:id/response', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    const { text, author, authorRole } = req.body;
    const ticket = await TicketModel.findByIdAndUpdate(
      req.params.id,
      { $push: { responses: { id: `r_${Date.now()}`, text, author: author ?? 'Suporte', authorRole: authorRole ?? 'supervisor', createdAt: new Date().toISOString() } }, $set: { status: 'inProgress', updatedAt: new Date().toISOString() } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/tickets/:id/priority', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    const ticket = await TicketModel.findByIdAndUpdate(req.params.id, { $set: { priority: req.body.priority, updatedAt: new Date().toISOString() } }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/tickets/:id/status', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    const ticket = await TicketModel.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status, updatedAt: new Date().toISOString() } }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.patch('/tickets/:id/rate', async (req, res) => {
  if (!dbReady()) return res.status(503).json({ message: 'Banco de dados não disponível' });
  try {
    const { stars, comment } = req.body;
    const ticket = await TicketModel.findByIdAndUpdate(req.params.id, { $set: { rating: { stars, comment }, status: 'closed', updatedAt: new Date().toISOString() } }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket não encontrado' });
    res.json(ticket);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── IA ───────────────────────────────────────────────────────────────────────

const GEMINI_API_KEY     = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const geminiClient = GEMINI_API_KEY ? new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: GEMINI_API_KEY,
  timeout: 20_000,
}) : null;

const openrouterClient = OPENROUTER_API_KEY ? new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY,
  timeout: 12_000,
}) : null;

if (!geminiClient && !openrouterClient) {
  console.error('❌ Nenhuma chave de IA configurada no .env!');
  process.exit(1);
}
if (geminiClient)     console.log('🤖 Gemini configurado como IA primária');
if (openrouterClient) console.log('🔄 OpenRouter configurado como fallback');

const VALID_CATEGORIES = ['Entrega', 'Faturamento', 'Produto', 'Comercial', 'Suporte TI', 'Outro'];

const SYSTEM_PROMPT = `Você é a Kozzy, assistente virtual da Kozzy Alimentos. Responda SEMPRE em português brasileiro.

FLUXO OBRIGATÓRIO para abrir um chamado:
Passo 1 — Pergunte: "Qual é o assunto do problema?" (se o cliente não disse)
Passo 2 — Pergunte: "Em qual categoria se encaixa? Entrega / Faturamento / Produto / Comercial / Suporte TI / Outro"
Passo 3 — Pergunte: "Pode descrever o problema com mais detalhes?"
Passo 4 — Somente depois de ter as 3 respostas, emita o KOZZY_TICKET.

REGRAS RÍGIDAS:
- Se o cliente disse APENAS "quero abrir chamado" ou similar, faça o Passo 1. NÃO crie ticket ainda.
- Só emita KOZZY_TICKET quando tiver ASSUNTO real + CATEGORIA válida + DESCRIÇÃO com detalhes.
- ASSUNTO deve ter no mínimo 5 palavras descrevendo o problema.
- CATEGORIA deve ser exatamente uma de: Entrega, Faturamento, Produto, Comercial, Suporte TI, Outro.
- DESCRIÇÃO deve ter no mínimo 15 palavras com detalhes do problema.
- Nunca invente informações; use só o que o cliente disse.
- Para perguntas gerais sem problema, responda normalmente sem criar ticket.

FORMATO do ticket (use {} nunca []):
KOZZY_TICKET:{"subject":"Produto com defeito na embalagem","category":"Produto","description":"Recebi o lote 882 com embalagens amassadas e o produto vazando."}
Mensagem amigável confirmando o registro.`;

const PREFERRED = [
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'nousresearch/hermes-3-llama-3.1-8b:free',
  'mistralai/mistral-nemo:free',
  'qwen/qwen3-8b:free',
  'google/gemma-3-27b-it:free',
  'deepseek/deepseek-chat:free',
  'google/gemma-3-12b-it:free',
  'microsoft/phi-3-mini-128k-instruct:free',
];

const UNSUITABLE = [
  'content-safety', 'content-filter', 'code:', 'north-mini-code',
  'reasoning', 'poolside', 'nemotron', 'thinking',
  '1.2b', '0.5b', '1b:', 'a3b',
];
const isChatModel = (id) => !UNSUITABLE.some(p => id.includes(p));

const blacklist = new Map();
const BLACKLIST_TTL = 10 * 60 * 1000;
const isBlacklisted = (model) => {
  const ts = blacklist.get(model);
  if (!ts) return false;
  if (Date.now() - ts > BLACKLIST_TTL) { blacklist.delete(model); return false; }
  return true;
};
const leastRecentlyBlocked = () => {
  let oldest = null; let oldestTs = Infinity;
  for (const [model, ts] of blacklist.entries()) {
    if (ts < oldestTs) { oldest = model; oldestTs = ts; }
  }
  return oldest;
};

let models = [];
let modelIdx = 0;

async function loadModels() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
    });
    const { data } = await res.json();
    const freeIds = (data ?? []).filter(m => m.id.endsWith(':free') && isChatModel(m.id)).map(m => m.id);
    const freeSet = new Set(freeIds);
    const preferred = PREFERRED.filter(m => freeSet.has(m));
    const others = freeIds.filter(m => !PREFERRED.includes(m));
    models = [...preferred, ...others];
    modelIdx = 0;
    console.log(`✅ ${models.length} modelos de chat gratuitos encontrados`);
    if (models.length > 0) console.log(`🤖 Fallback: ${models[0]}`);
  } catch (err) {
    console.error('Erro ao carregar modelos:', err.message);
    models = PREFERRED;
  }
}

async function callAI(messages) {
  // ── 1. Gemini (primário) ──────────────────────────────────────────────────
  if (geminiClient) {
    for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
      try {
        const completion = await geminiClient.chat.completions.create({ model, messages });
        const text = completion.choices[0]?.message?.content;
        if (!text) throw new Error('Resposta vazia');
        console.log(`✅ Gemini ok (${model})`);
        return { text, model };
      } catch (err) {
        console.warn(`⚠️ Gemini ${model} falhou (${err.status ?? err.message})`);
      }
    }
  }

  // ── 2. OpenRouter (fallback) ──────────────────────────────────────────────
  if (!openrouterClient) throw new Error('Nenhum provedor de IA disponível.');
  if (models.length === 0) await loadModels();

  for (let attempt = 0; attempt < models.length; attempt++) {
    let model = models[modelIdx];
    if (isBlacklisted(model)) {
      modelIdx = (modelIdx + 1) % models.length;
      if (attempt === models.length - 1) {
        model = leastRecentlyBlocked() ?? model;
        console.warn(`⚡ Todos bloqueados — tentando ${model} (menos recente)`);
      } else { continue; }
    }
    try {
      const completion = await openrouterClient.chat.completions.create({ model, messages });
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('Resposta vazia');
      console.log(`✅ OpenRouter ok (${model})`);
      return { text, model };
    } catch (err) {
      if (err.status === 429) { blacklist.set(model, Date.now()); console.warn(`⛔ ${model} → 429, bloqueado por 10 min`); }
      else { console.warn(`⚠️ ${model} falhou (${err.status ?? '?'})`); }
      modelIdx = (modelIdx + 1) % models.length;
    }
  }
  throw new Error('Todos os modelos disponíveis falharam. Tente em alguns minutos.');
}

app.post('/chat', optionalAuth, async (req, res) => {
  try {
    if (!req.body?.message) return res.status(400).json({ message: 'Mensagem vazia!' });
    const { message, userName = 'Cliente', history = [] } = req.body;
    const name = req.user?.name ?? userName;
    console.log(`💬 [${name}]: ${message}`);

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nO cliente se chama ${name}.` },
      ...history,
      { role: 'user', content: message },
    ];

    const { text } = await callAI(messages);

    const markerIdx = text.indexOf('KOZZY_TICKET:');
    if (markerIdx !== -1) {
      const jsonStart = text.indexOf('{', markerIdx);
      if (jsonStart !== -1) {
        let depth = 0, inString = false, escape = false, jsonEnd = -1;
        for (let i = jsonStart; i < text.length; i++) {
          const ch = text[i];
          if (escape) { escape = false; continue; }
          if (ch === '\\' && inString) { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') depth++;
          else if (ch === '}') { if (--depth === 0) { jsonEnd = i; break; } }
        }
        if (jsonEnd !== -1) {
          try {
            const ticketData = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
            const validTicket =
              ticketData.subject?.trim().length >= 5 &&
              ticketData.description?.trim().split(/\s+/).length >= 5 &&
              VALID_CATEGORIES.includes(ticketData.category);
            if (validTicket) {
              const cleanText = text.slice(0, markerIdx) + text.slice(jsonEnd + 1);
              console.log(`🎫 Ticket IA:`, ticketData);
              return res.json({ response: cleanText.trim(), createTicket: ticketData });
            }
            console.warn('🚫 Ticket rejeitado — dados insuficientes:', ticketData);
          } catch { /* JSON inválido */ }
        }
        // Fallback: ] em vez de }
        const afterOpen = text.slice(jsonStart);
        const bracketIdx = afterOpen.search(/\](?=\s*\n|$)/);
        if (bracketIdx !== -1) {
          try {
            const ticketData = JSON.parse(afterOpen.slice(0, bracketIdx) + '}');
            const cleanText = text.slice(0, markerIdx) + text.slice(jsonStart + bracketIdx + 1);
            return res.json({ response: cleanText.trim(), createTicket: ticketData });
          } catch { /* ainda inválido */ }
        }
      }
    }
    res.json({ response: text });
  } catch (error) {
    const msg = error?.message ?? String(error);
    console.error('❌', msg);
    res.status(500).json({ message: msg });
  }
});

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    primaryAI: geminiClient ? 'gemini' : 'openrouter',
    fallbackModel: models[modelIdx] ?? 'nenhum',
    db: dbReady() ? 'connected' : 'disconnected',
  });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Kozzy rodando em http://localhost:${PORT}`);
  if (openrouterClient) await loadModels();
});
