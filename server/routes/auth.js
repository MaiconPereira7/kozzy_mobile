const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = express.Router();
const SALT = 10;

// Store em memória com seed de contas iniciais
const users = new Map();

(async () => {
  const [supHash, cliHash] = await Promise.all([
    bcrypt.hash('123456', SALT),
    bcrypt.hash('123456', SALT),
  ]);
  users.set('supervisor@kozzy.com', {
    id: 'sup_1',
    name: 'Ana Supervisora',
    email: 'supervisor@kozzy.com',
    role: 'supervisor',
    passwordHash: supHash,
  });
  users.set('cliente@kozzy.com', {
    id: 'cli_1',
    name: 'João Cliente',
    email: 'cliente@kozzy.com',
    role: 'user',
    passwordHash: cliHash,
  });
  console.log('✅ Contas seed: supervisor@kozzy.com e cliente@kozzy.com (senha: 123456)');
})();

const safe = ({ passwordHash, ...u }) => u;

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 6 caracteres' });
    }
    const key = email.toLowerCase().trim();
    if (users.has(key)) {
      return res.status(409).json({ message: 'E-mail já cadastrado' });
    }
    const passwordHash = await bcrypt.hash(password, SALT);
    const user = { id: `user_${Date.now()}`, name: name.trim(), email: key, role: 'user', passwordHash };
    users.set(key, user);
    const token = generateToken(user);
    return res.status(201).json({ success: true, user: safe(user), token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' });
    }
    const user = users.get(email.toLowerCase().trim());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos' });
    }
    const token = generateToken(user);
    return res.json({ success: true, user: safe(user), token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// GET /auth/me
router.get('/me', requireAuth, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  return res.json(safe(user));
});

module.exports = router;
