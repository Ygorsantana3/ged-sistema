// === userRoutes.js ===
const router = require('express').Router();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', rbacMiddleware('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, perfil, status, ultimo_login, criado_em FROM users ORDER BY nome');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar usuários' }); }
});

router.put('/:id', rbacMiddleware('admin'), async (req, res) => {
  try {
    const { nome, email, perfil, status, senha } = req.body;
    let query, params;
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      query = 'UPDATE users SET nome=$1, email=$2, perfil=$3, status=$4, senha_hash=$5 WHERE id=$6 RETURNING id, nome, email, perfil, status';
      params = [nome, email, perfil, status, hash, req.params.id];
    } else {
      query = 'UPDATE users SET nome=$1, email=$2, perfil=$3, status=$4 WHERE id=$5 RETURNING id, nome, email, perfil, status';
      params = [nome, email, perfil, status, req.params.id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Erro ao atualizar usuário' }); }
});

router.delete('/:id', rbacMiddleware('admin'), async (req, res) => {
  try {
    await pool.query("UPDATE users SET status = 'inativo' WHERE id = $1", [req.params.id]);
    res.json({ message: 'Usuário desativado' });
  } catch (err) { res.status(500).json({ error: 'Erro ao desativar usuário' }); }
});

module.exports = router;
