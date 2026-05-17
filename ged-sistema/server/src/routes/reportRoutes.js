const router = require('express').Router();
const { pool } = require('../config/database');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(rbacMiddleware('admin'));

router.get('/audit', async (req, res) => {
  try {
    const { inicio, fim, acao, usuario_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params = [];
    if (inicio) { params.push(inicio); where += ` AND al.criado_em >= $${params.length}`; }
    if (fim) { params.push(fim); where += ` AND al.criado_em <= $${params.length}`; }
    if (acao) { params.push(acao); where += ` AND al.acao = $${params.length}`; }
    if (usuario_id) { params.push(usuario_id); where += ` AND al.usuario_id = $${params.length}`; }
    params.push(limit, offset);

    const result = await pool.query(
      `SELECT al.*, u.nome as usuario_nome, d.titulo as documento_titulo
       FROM audit_logs al LEFT JOIN users u ON al.usuario_id = u.id
       LEFT JOIN documents d ON al.documento_id = d.id
       WHERE ${where} ORDER BY al.criado_em DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao buscar logs' }); }
});

router.get('/stats', async (req, res) => {
  try {
    const docs = await pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE ocr_status='processado') as processados FROM documents WHERE excluido=FALSE");
    const users = await pool.query("SELECT COUNT(*) FROM users WHERE status='ativo'");
    const uploads = await pool.query("SELECT COUNT(*) FROM audit_logs WHERE acao='upload' AND criado_em >= NOW() - INTERVAL '30 days'");
    res.json({
      total_documentos: parseInt(docs.rows[0].total),
      ocr_processados: parseInt(docs.rows[0].processados),
      usuarios_ativos: parseInt(users.rows[0].count),
      uploads_mes: parseInt(uploads.rows[0].count),
    });
  } catch (err) { res.status(500).json({ error: 'Erro ao buscar estatísticas' }); }
});

module.exports = router;
