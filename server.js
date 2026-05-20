// server.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// --- CONFIGURAÇÃO OBRIGATÓRIA (MIDDLEWARES) ---
app.use(cors()); // Libera o acesso do celular ao PC
app.use(express.json()); // Resolve o erro do 'body' undefined
app.use(express.urlencoded({ extended: true }));

// Busca a chave da API do arquivo .env em vez de deixar hardcoded
const API_KEY = process.env.GEMINI_API_KEY;

// Trava de segurança: se esquecer de configurar o .env, o server avisa e não quebra depois
if (!API_KEY) {
    console.error("❌ ERRO: Chave GEMINI_API_KEY não encontrada no arquivo .env!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/chat', async (req, res) => {
    try {
        // Validação de segurança para não quebrar o server
        if (!req.body || !req.body.message) {
            return res.status(400).json({ error: "Mensagem vazia!" });
        }

        // Se o front-end não enviar o userName, usa "Cliente" como padrão
        const { message, userName = "Cliente" } = req.body;
        console.log(`💬 Mensagem recebida de ${userName}: ${message}`);

        const prompt = `Você é a Kozzy, assistente virtual da Kozzy Alimentos. 
        Seu objetivo é ajudar o cliente ${userName}.
        Seja educada, profissional e use emojis moderadamente.
        Se ele quiser abrir um ticket, peça a área e a descrição.
        Mensagem do usuário: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        // Mostra o erro exato no terminal para facilitar o debug
        console.error("❌ Erro detalhado no Gemini:", error.message || error);
        res.status(500).json({ error: "Erro interno ao processar a IA. Tente novamente." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Kozzy rodando em http://localhost:${PORT}`);
});