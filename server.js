// server.js
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// --- CONFIGURAÇÃO OBRIGATÓRIA (MIDDLEWARES) ---
app.use(cors()); // Libera o acesso do celular ao PC
app.use(express.json()); // <--- ISSO RESOLVE O ERRO DO 'BODY' UNDEFINED
app.use(express.urlencoded({ extended: true }));

// Substitua pela sua chave do Google AI Studio (https://aistudio.google.com/)
const API_KEY = "SUA_API_KEY_AQUI"; 
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/chat', async (req, res) => {
    try {
        // Validação de segurança para não quebrar o server
        if (!req.body || !req.body.message) {
            return res.status(400).json({ error: "Mensagem vazia!" });
        }

        const { message, userName } = req.body;
        console.log(`Mensagem recebida de ${userName}: ${message}`);

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
        console.error("Erro no Gemini:", error);
        res.status(500).json({ error: "Erro ao processar IA" });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Kozzy rodando em http://localhost:${PORT}`);
});