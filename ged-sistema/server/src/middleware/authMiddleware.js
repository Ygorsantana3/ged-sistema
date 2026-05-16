const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ged-sistema-secret-key';

// Middleware de autenticação JWT (RN01)
exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Middleware RBAC - Controle de acesso por perfil (RN02, RN03, RN04)
exports.rbacMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!allowedRoles.includes(req.user.perfil)) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
    next();
  };
};
