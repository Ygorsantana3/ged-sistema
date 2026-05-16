const router = require('express').Router();
const { pool } = require('../config/database');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Listar pastas em árvore
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM folders ORDER BY nome');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao listar pastas' }); }
});

// Criar pasta
router.post('/', rbacMiddleware('admin', 'operador'), async (req, res) => {
  try {
    const { nome, pasta_pai_id } = req.body;
    const exists = await pool.query('SELECT id FROM folders WHERE nome = $1 AND pasta_pai_id IS NOT DISTINCT FROM $2', [nome, pasta_pai_id || null]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'Pasta com este nome já existe neste nível' });

    const result = await pool.query(
      'INSERT INTO folders (nome, pasta_pai_id, criado_por) VALUES ($1, $2, $3) RETURNING *',
      [nome, pasta_pai_id || null, req.user.id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Erro ao criar pasta' }); }
});

// Renomear pasta
router.put('/:id', rbacMiddleware('admin', 'operador'), async (req, res) => {
  try {
    const result = await pool.query('UPDATE folders SET nome = $1 WHERE id = $2 RETURNING *', [req.body.nome, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pasta não encontrada' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Erro ao renomear pasta' }); }
});

// Excluir pasta
router.delete('/:id', rbacMiddleware('admin', 'operador'), async (req, res) => {
  try {
    await pool.query('DELETE FROM folders WHERE id = $1', [req.params.id]);
    res.json({ message: 'Pasta excluída' });
  } catch (err) { res.status(500).json({ error: 'Erro ao excluir pasta' }); }
});

module.exports = router;
