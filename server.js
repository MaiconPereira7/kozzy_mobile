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

// Modelos de chat preferidos — NÃO incluir code/safety/reasoning especializados
// cohere/north-mini-code removido — modelo de código que não segue prompts de chat

// Modelos de chat preferidos — NÃO incluir code/safety/reasoning especializados
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

// Padrões de modelos especializados que NÃO servem para chat
const UNSUITABLE = [
  'content-safety', 'content-filter', 'code:', 'north-mini-code',
  'reasoning', 'poolside', 'nemotron', 'thinking',  // thinking models quebram prompts de chat
  '1.2b', '0.5b', '1b:', 'a3b',                    // modelos muito pequenos (<2B params)
];
const isChatModel = (id) => !UNSUITABLE.some(p => id.includes(p));

// Blacklist: modelos que deram 429 ficam bloqueados por 10 minutos
const blacklist = new Map();
const BLACKLIST_TTL = 10 * 60 * 1000;
const isBlacklisted = (model) => {
  const ts = blacklist.get(model);
  if (!ts) return false;
  if (Date.now() - ts > BLACKLIST_TTL) { blacklist.delete(model); return false; }
  return true;
};
// Retorna o modelo bloqueado há mais tempo (maior chance de ter sido liberado)
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
    let model = models[modelIdx];

    if (isBlacklisted(model)) {
      modelIdx = (modelIdx + 1) % models.length;
      // Todos bloqueados: usa o menos recente como última tentativa
      if (attempt === models.length - 1) {
        model = leastRecentlyBlocked() ?? model;
        console.warn(`⚡ Todos bloqueados — tentando ${model} (menos recente)`);
      } else {
        continue;
      }
    }

    try {
      const completion = await client.chat.completions.create({ model, messages });
      const text = completion.choices[0]?.message?.content;
      if (!text) throw new Error('Resposta vazia');
      console.log(`✅ Resposta ok (${model})`);
      return { text, model };
    } catch (err) {
      if (err.status === 429) {
        blacklist.set(model, Date.now());
        console.warn(`⛔ ${model} → 429, bloqueado por 10 min`);
      } else {
        console.warn(`⚠️ ${model} falhou (${err.status ?? '?'}) — próximo...`);
      }
      modelIdx = (modelIdx + 1) % models.length;
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

    // Detecta se a IA quer criar um ticket usando casamento de chaves balanceado
    const markerIdx = text.indexOf('KOZZY_TICKET:');
    if (markerIdx !== -1) {
      const jsonStart = text.indexOf('{', markerIdx);
      if (jsonStart !== -1) {
        // Percorre o texto contando { e } para encontrar o bloco JSON completo,
        // ignorando chaves dentro de strings (entre aspas, respeitando \")
        let depth = 0;
        let inString = false;
        let escape = false;
        let jsonEnd = -1;
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
            const jsonBlock = text.slice(jsonStart, jsonEnd + 1);
            const ticketData = JSON.parse(jsonBlock);

            // Valida que o ticket tem dados reais antes de aceitar
            const validTicket =
              ticketData.subject?.trim().length >= 5 &&
              ticketData.description?.trim().split(/\s+/).length >= 5 &&
              VALID_CATEGORIES.includes(ticketData.category);

            if (validTicket) {
              const cleanText = text.slice(0, markerIdx) + text.slice(jsonEnd + 1);
              console.log(`🎫 Ticket criado:`, ticketData);
              return res.json({ response: cleanText.trim(), createTicket: ticketData });
            }
            console.warn('🚫 Ticket rejeitado — dados insuficientes:', ticketData);
          } catch {
            // JSON inválido — tenta fallback abaixo
          }
        }

        // Fallback: alguns modelos usam ] em vez de } para fechar o objeto JSON
        const afterOpen = text.slice(jsonStart);
        const bracketIdx = afterOpen.search(/\](?=\s*\n|$)/);
        if (bracketIdx !== -1) {
          try {
            const candidate = afterOpen.slice(0, bracketIdx) + '}';
            const ticketData = JSON.parse(candidate);
            const endPos = jsonStart + bracketIdx;
            const cleanText = text.slice(0, markerIdx) + text.slice(endPos + 1);
            console.log(`🎫 Ticket detectado (fallback ]):`, ticketData);
            return res.json({ response: cleanText.trim(), createTicket: ticketData });
          } catch {
            // Ainda inválido — trata como resposta normal
          }
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', activeModel: models[modelIdx] ?? 'nenhum' });
});

app.listen(3000, async () => {
  console.log('🚀 Servidor Kozzy rodando em http://localhost:3000');
  await loadModels();
});
