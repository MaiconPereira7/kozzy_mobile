// server.js - VERSÃO COM AUTO-CRIAÇÃO DE USUÁRIO
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// SUA CONEXÃO
const MONGO_URI = "mongodb+srv://eduardobarrosreis03:LZcOYBpywEeW2boO@app-kozzy.z8ovmnp.mongodb.net/?appName=App-Kozzys";

// --- MODELO ---
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar: String
});
// Forçando o nome da coleção para 'users' para evitar confusão
const User = mongoose.model('User', UserSchema, 'users');

// --- CONEXÃO E AUTO-SETUP ---
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🔥 CONECTADO AO MONGODB!');

    try {
      // Verifica se existe algum usuário
      const count = await User.countDocuments();
      if (count === 0) {
        console.log("\n⚠️ BANCO VAZIO DETECTADO!");
        console.log("⚙️ Criando usuário ADMIN automático...");
        
        await User.create({
          name: "Admin Kozzy",
          email: "admin@kozzy.com",
          password: "123",
          avatar: null
        });
        
        console.log("✅ USUÁRIO CRIADO COM SUCESSO:");
        console.log("   📧 Email: admin@kozzy.com");
        console.log("   🔑 Senha: 123");
        console.log("👉 TENTE LOGAR COM ESSES DADOS AGORA!\n");
      } else {
        console.log(`✅ O banco já tem ${count} usuário(s) cadastrado(s).`);
      }
    } catch (err) {
      console.log("Erro ao verificar usuários:", err);
    }
  })
  .catch(err => console.log('❌ ERRO NA CONEXÃO COM O BANCO:', err));

// --- ROTA DE LOGIN DIAGNÓSTICA ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`\n📨 RECEBI PEDIDO DE LOGIN:`);
  console.log(`   Email: [${email}]`);
  console.log(`   Senha: [${password}]`);

  try {
    if (!email || !password) {
        console.log("❌ Falha: Email ou senha vazios.");
        return res.status(400).json({ error: 'Preencha email e senha' });
    }

    // Busca exata
    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      console.log("❌ Falha: Usuário NÃO existe no banco.");
      return res.status(401).json({ error: 'Usuário não encontrado. Use admin@kozzy.com' });
    }

    if (user.password !== password.trim()) {
      console.log(`❌ Falha: Senha errada para ${email}.`);
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    console.log("✅ SUCESSO: Login autorizado! Enviando resposta...");
    res.json({ 
      message: 'Login OK', 
      user: { id: user._id, name: user.name, email: user.email, role: 'supervisor' }
    });

  } catch (error) {
    console.error("❌ ERRO INTERNO DO SERVIDOR:", error);
    res.status(500).json({ error: 'Erro no Servidor (Veja o terminal do PC)' });
  }
});

// Acesso liberado para a rede
app.listen(3000, '0.0.0.0', () => console.log('🚀 SERVIDOR RODANDO!'));