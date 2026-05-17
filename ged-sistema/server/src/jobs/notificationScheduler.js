const { pool } = require('../config/database');

// Job executado diariamente para verificar vencimentos (RF10)
async function checkExpiringDocuments() {
  try {
    const intervals = [
      { days: 7, msg: 'vence em 7 dias' },
      { days: 15, msg: 'vence em 15 dias' },
      { days: 30, msg: 'vence em 30 dias' },
    ];

    for (const { days, msg } of intervals) {
      const result = await pool.query(
        `SELECT d.id, d.titulo, d.data_validade, d.criado_por FROM documents d
         WHERE d.excluido = FALSE AND d.data_validade IS NOT NULL
         AND d.data_validade = CURRENT_DATE + $1 * INTERVAL '1 day'`,
        [days]
      );

      for (const doc of result.rows) {
        const exists = await pool.query(
          `SELECT id FROM notifications WHERE documento_id = $1 AND tipo = $2
           AND criado_em >= CURRENT_DATE`, [doc.id, `vencimento_${days}d`]);

        if (exists.rows.length === 0) {
          await pool.query(
            `INSERT INTO notifications (usuario_id, documento_id, tipo, titulo, mensagem)
             VALUES ($1, $2, $3, $4, $5)`,
            [doc.criado_por, doc.id, `vencimento_${days}d`,
             'Documento próximo do vencimento',
             `O documento "${doc.titulo}" ${msg} (${doc.data_validade.toISOString().split('T')[0]}).`]
          );
        }
      }
    }
    console.log('Verificação de vencimentos concluída');
  } catch (err) {
    console.error('Erro na verificação de vencimentos:', err);
  }
}

module.exports = { checkExpiringDocuments };
