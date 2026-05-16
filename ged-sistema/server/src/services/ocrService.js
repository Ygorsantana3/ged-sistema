const Tesseract = require('tesseract.js');
const { pool } = require('../config/database');
const { s3Client, BUCKET_NAME, GetObjectCommand } = require('../config/aws');

async function processDocument(documentId) {
  try {
    await pool.query("UPDATE documents SET ocr_status = 'processando' WHERE id = $1", [documentId]);

    const doc = await pool.query('SELECT * FROM documents WHERE id = $1', [documentId]);
    if (doc.rows.length === 0) return;

    const document = doc.rows[0];

    // Baixar arquivo do S3
    const s3Response = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: document.s3_key }));
    const chunks = [];
    for await (const chunk of s3Response.Body) { chunks.push(chunk); }
    const buffer = Buffer.concat(chunks);

    // Processar OCR com Tesseract.js (suporte português)
    const { data } = await Tesseract.recognize(buffer, 'por', {
      logger: (m) => { if (m.status === 'recognizing text') console.log(`OCR ${documentId}: ${Math.round(m.progress * 100)}%`); }
    });

    const confianca = data.confidence;
    const texto = data.text;

    await pool.query(
      "UPDATE documents SET ocr_texto = $1, ocr_confianca = $2, ocr_status = 'processado' WHERE id = $3",
      [texto, confianca, documentId]
    );

    console.log(`OCR concluído para ${documentId} - Confiança: ${confianca}%`);

    // Notificar se confiança baixa
    if (confianca < 60) {
      await pool.query(
        `INSERT INTO notifications (usuario_id, documento_id, tipo, titulo, mensagem)
         VALUES ($1, $2, 'ocr_baixa_confianca', 'OCR com baixa confiança',
         $3)`,
        [document.criado_por, documentId,
         `O documento "${document.titulo}" foi processado com ${confianca}% de confiança. Revisão manual recomendada.`]
      );
    }
  } catch (err) {
    console.error(`Erro no OCR para ${documentId}:`, err);
    await pool.query("UPDATE documents SET ocr_status = 'erro' WHERE id = $1", [documentId]);
  }
}

module.exports = { processDocument };
