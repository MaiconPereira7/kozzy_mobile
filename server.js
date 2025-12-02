// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONEXÃO COM O BANCO ---
// ⚠️ IMPORTANTE: Substitua pela sua URL de conexão real do MongoDB Atlas
const MONGO_URI = "mongodb+srv://eduardobarrosreis03:LZcOYBpywEeW2boO@app-kozzy.z8ovmnp.mongodb.net/?appName=App-Kozzys";

mongoose.connect(MONGO_URI)
  .then(() => console.log('🔥 Conectado ao MongoDB!'))
  .catch(err => console.log('❌ Erro na conexão:', err));

// --- MODELOS ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String
});
const User = mongoose.model('User', UserSchema);

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
const Ticket = mongoose.model('Ticket', TicketSchema);

// --- ROTAS ---

// Login (Usado pelo App)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({ 
      message: 'Login OK', 
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no login' });
  }
});

// Criar Usuário (Use o Postman para criar usuários, pois removemos a tela do app)
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password, avatar: null });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

// Buscar Tickets (Usado pela Home)
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
});

// Criar Ticket (Para popular o banco via Postman)
app.post('/tickets', async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.json(newTicket);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar ticket' });
  }
});

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));