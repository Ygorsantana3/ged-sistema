const { pool } = require('../config/database');

exports.auditMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (req.user && res.statusCode < 400) {
      const actionMap = {
        'POST /api/documents/upload': 'upload',
        'DELETE /api/documents': 'delete',
        'PUT /api/documents': 'edit',
        'PUT /api/users': 'permission',
        'POST /api/auth/login': 'login',
      };

      const routeKey = Object.keys(actionMap).find(k => {
        const [method, path] = k.split(' ');
        return req.method === method && req.originalUrl.startsWith(path);
      });

      if (routeKey) {
        const ip = req.ip || req.connection.remoteAddress;
        pool.query(
          'INSERT INTO audit_logs (usuario_id, acao, documento_id, detalhes, ip_address) VALUES ($1, $2, $3, $4, $5)',
          [req.user.id, actionMap[routeKey], req.params.id || null,
           JSON.stringify({ method: req.method, url: req.originalUrl }), ip]
        ).catch(err => console.error('Erro no log de auditoria:', err));
      }
    }
    originalSend.call(this, body);
  };
  next();
};
