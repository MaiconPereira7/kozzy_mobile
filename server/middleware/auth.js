const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kozzy-secret-mude-em-producao';

const generateToken = (user) => jwt.sign(
  { id: user.id, name: user.name, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try { req.user = jwt.verify(auth.slice(7), JWT_SECRET); } catch { /* ignora */ }
  }
  next();
};

module.exports = { generateToken, requireAuth, optionalAuth };
