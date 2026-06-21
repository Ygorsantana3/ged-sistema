const router = require('express').Router();
const { pool } = require('../config/database');
const { getStorageUsed } = require('../config/storage');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/stats', async (req, res) => {
  try {
    const docs = await pool.query("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE ocr_status='processado') as processados FROM documents WHERE excluido=FALSE");
    const users = await pool.query("SELECT COUNT(*) FROM users WHERE status='ativo'");
    const uploads = await pool.query("SELECT COUNT(*) FROM audit_logs WHERE acao='upload' AND criado_em >= NOW() - INTERVAL '30 days'");

    const monthly = await pool.query(
      `SELECT EXTRACT(MONTH FROM criado_em)::int as mes, COUNT(*)::int as total
       FROM documents WHERE excluido = FALSE AND criado_em >= date_trunc('year', NOW())
       GROUP BY mes ORDER BY mes`
    );
    const monthlyData = Array(12).fill(0);
    monthly.rows.forEach(r => { monthlyData[r.mes - 1] = r.total; });

    const recent = await pool.query(
      `SELECT al.acao, al.criado_em, u.nome as usuario_nome, d.titulo as documento_titulo
       FROM audit_logs al LEFT JOIN users u ON al.usuario_id = u.id
       LEFT JOIN documents d ON al.documento_id = d.id
       ORDER BY al.criado_em DESC LIMIT 5`
    );

    const storageBytes = getStorageUsed();

    res.json({
      total_documentos: parseInt(docs.rows[0].total),
      ocr_processados: parseInt(docs.rows[0].processados),
      usuarios_ativos: parseInt(users.rows[0].count),
      uploads_mes: parseInt(uploads.rows[0].count),
      monthly: monthlyData,
      recent_activity: recent.rows,
      storage_bytes: storageBytes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

router.get('/audit', rbacMiddleware('admin'), async (req, res) => {
  try {
    const { inicio, fim, acao, usuario_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    let where = '1=1';
    const params = [];
    if (inicio) { params.push(inicio); where += ` AND al.criado_em >= $${params.length}`; }
    if (fim) { params.push(fim + 'T23:59:59'); where += ` AND al.criado_em <= $${params.length}`; }
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

router.get('/audit/csv', rbacMiddleware('admin'), async (req, res) => {
  try {
    const { inicio, fim, acao } = req.query;
    let where = '1=1';
    const params = [];
    if (inicio) { params.push(inicio); where += ` AND al.criado_em >= $${params.length}`; }
    if (fim) { params.push(fim + 'T23:59:59'); where += ` AND al.criado_em <= $${params.length}`; }
    if (acao) { params.push(acao); where += ` AND al.acao = $${params.length}`; }

    const result = await pool.query(
      `SELECT al.criado_em, u.nome as usuario, al.acao, d.titulo as documento, al.ip_address
       FROM audit_logs al LEFT JOIN users u ON al.usuario_id = u.id
       LEFT JOIN documents d ON al.documento_id = d.id
       WHERE ${where} ORDER BY al.criado_em DESC`, params);

    const header = 'Data/Hora;Usuario;Acao;Documento;IP\n';
    const rows = result.rows.map(r =>
      `${new Date(r.criado_em).toLocaleString('pt-BR')};${r.usuario || 'Sistema'};${r.acao};${r.documento || ''};${r.ip_address || ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=auditoria.csv');
    res.send('﻿' + header + rows);
  } catch (err) { res.status(500).json({ error: 'Erro ao exportar CSV' }); }
});

module.exports = router;
