const router = require('express').Router();
const { pool } = require('../config/database');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY nome');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar categorias' }); }
});

router.post('/', rbacMiddleware('admin'), async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (nome, descricao) VALUES ($1, $2) RETURNING *',
      [nome, descricao || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Categoria já existe' });
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

module.exports = router;
