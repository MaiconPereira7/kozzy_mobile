// api-kozzy/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DO BANCO ---
// COLOQUE AQUI A URL DO SEU BANCO DE DADOS DO SITE (MongoDB Atlas ou VPS)
// Exemplo: "mongodb+srv://admin:senha123@cluster0.mongodb.net/kozzy_db"
const MONGO_URI = "mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/NOME_DO_BANCO";

mongoose.connect(MONGO_URI)
  .then(() => console.log('🔥 Conectado ao Banco do Site!'))
  .catch(err => console.log('❌ Erro na conexão:', err));

// --- MODELO (Schema) ---
// Importante: Os nomes aqui devem ser iguais aos que você salvou no site.
// Se no site você salvou como "cliente_nome", aqui tem que ser "cliente_nome".
// Vou usar os nomes que definimos no App, ajuste conforme seu banco real.
const TicketSchema = new mongoose.Schema({
  name: String,        
  subject: String,     
  type: String,        // ativo, andamento, fechado
  protocol: String,
  clientType: String,
  category: String,
  description: String,
  date: String,
  time: String,
});

// "Ticket" é o nome da coleção. Se no banco estiver "chamados", mude para mongoose.model('chamados', TicketSchema)
const Ticket = mongoose.model('Ticket', TicketSchema);

// --- ROTAS ---
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find(); // Pega tudo do banco
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

// Rota para criar um teste (caso precise popular o banco)
app.post('/tickets', async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar' });
  }
});

// Rodar na porta 3000
app.listen(3000, () => console.log('🚀 API rodando na porta 3000'));