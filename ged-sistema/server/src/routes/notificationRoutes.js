const router = require('express').Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, d.titulo as documento_titulo FROM notifications n
       LEFT JOIN documents d ON n.documento_id = d.id
       WHERE n.usuario_id = $1 ORDER BY n.criado_em DESC LIMIT 50`,
      [req.user.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar notificações' }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET lida = TRUE WHERE id = $1 AND usuario_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Notificação marcada como lida' });
  } catch (err) { res.status(500).json({ error: 'Erro' }); }
});

module.exports = router;
