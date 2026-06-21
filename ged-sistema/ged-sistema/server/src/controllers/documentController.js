const { pool } = require('../config/database');
const { saveFile, saveVersionFile, getFileUrl } = require('../config/storage');
const path = require('path');

exports.upload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const allowedFormats = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedFormats.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Formato não suportado. Use PDF, JPEG, PNG ou TIFF' });
    }
    if (file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'Arquivo excede o limite de 50 MB' });
    }

    const { key, url } = await saveFile(file.buffer, file.originalname, file.mimetype);
    const { titulo, categoria_id, pasta_id, autor, palavras_chave, data_documento, data_validade, descricao } = req.body;

    const result = await pool.query(
      `INSERT INTO documents (titulo, descricao, categoria_id, pasta_id, autor, palavras_chave, formato, tamanho, s3_key, s3_url, data_documento, data_validade, criado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [titulo, descricao, categoria_id || null, pasta_id || null, autor,
       palavras_chave ? palavras_chave.split(',').map(k => k.trim()) : null,
       path.extname(file.originalname).replace('.', '').toUpperCase(),
       file.size, key, url,
       data_documento || null, data_validade || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar documento' });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, categoria_id, formato, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query, params;

    if (q) {
      query = `SELECT d.*, c.nome as categoria_nome,
        ts_rank(to_tsvector('portuguese', COALESCE(d.titulo,'') || ' ' || COALESCE(d.ocr_texto,'') || ' ' || COALESCE(d.descricao,'')),
        plainto_tsquery('portuguese', $1)) AS relevancia,
        ts_headline('portuguese', COALESCE(d.ocr_texto, d.titulo), plainto_tsquery('portuguese', $1),
        'MaxWords=35, MinWords=15, StartSel=<mark>, StopSel=</mark>') AS trecho
        FROM documents d LEFT JOIN categories c ON d.categoria_id = c.id
        WHERE d.excluido = FALSE AND to_tsvector('portuguese', COALESCE(d.titulo,'') || ' ' || COALESCE(d.ocr_texto,'') || ' ' || COALESCE(d.descricao,''))
        @@ plainto_tsquery('portuguese', $1)
        ORDER BY relevancia DESC LIMIT $2 OFFSET $3`;
      params = [q, limit, offset];
    } else {
      query = `SELECT d.*, c.nome as categoria_nome FROM documents d
        LEFT JOIN categories c ON d.categoria_id = c.id WHERE d.excluido = FALSE
        ORDER BY d.criado_em DESC LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM documents WHERE excluido = FALSE');

    res.json({ documents: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro na busca' });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE id = $1 AND excluido = FALSE', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado' });

    const doc = result.rows[0];
    const url = await getFileUrl(doc.s3_key);
    res.json({ url, documento: doc });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar link de download' });
  }
};

exports.updateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, categoria_id, pasta_id, autor, palavras_chave, data_documento, data_validade } = req.body;

    const result = await pool.query(
      `UPDATE documents SET titulo=$1, descricao=$2, categoria_id=$3, pasta_id=$4, autor=$5,
       palavras_chave=$6, data_documento=$7, data_validade=$8 WHERE id=$9 AND excluido=FALSE RETURNING *`,
      [titulo, descricao, categoria_id || null, pasta_id || null, autor,
       palavras_chave ? palavras_chave.split(',').map(k => k.trim()) : null,
       data_documento || null, data_validade || null, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar metadados' });
  }
};

exports.inactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE documents SET excluido = TRUE, excluido_em = NOW() WHERE id = $1 AND excluido = FALSE RETURNING id, titulo',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado ou já inativo' });
    res.json({ message: 'Documento inativado', documento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao inativar documento' });
  }
};

exports.reactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE documents SET excluido = FALSE, excluido_em = NULL WHERE id = $1 AND excluido = TRUE RETURNING id, titulo',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado ou já ativo' });
    res.json({ message: 'Documento reativado', documento: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao reativar documento' });
  }
};

exports.getVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, u.nome as criado_por_nome FROM versions v
       LEFT JOIN users u ON v.criado_por = u.id
       WHERE v.document_id = $1 ORDER BY v.numero_versao DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar versões' });
  }
};

exports.createVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Arquivo obrigatório' });

    const doc = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    if (doc.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado' });

    const novaVersao = doc.rows[0].versao_atual + 1;
    const key = await saveVersionFile(file.buffer, id, novaVersao, file.originalname, file.mimetype);

    await pool.query(
      'INSERT INTO versions (document_id, numero_versao, s3_key, tamanho, criado_por) VALUES ($1,$2,$3,$4,$5)',
      [id, novaVersao, key, file.size, req.user.id]
    );

    await pool.query('UPDATE documents SET versao_atual=$1, s3_key=$2, tamanho=$3 WHERE id=$4',
      [novaVersao, key, file.size, id]);

    res.status(201).json({ message: 'Nova versão criada', versao: novaVersao });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar versão' });
  }
};

exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.nome as categoria_nome, u.nome as criado_por_nome
       FROM documents d LEFT JOIN categories c ON d.categoria_id = c.id
       LEFT JOIN users u ON d.criado_por = u.id
       WHERE d.id = $1 AND d.excluido = FALSE`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Documento não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar documento' });
  }
};

exports.list = async (req, res) => {
  try {
    const { pasta_id, categoria_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let where = status === 'inativo' ? 'd.excluido = TRUE' : 'd.excluido = FALSE';
    const params = [];
    if (pasta_id) { params.push(pasta_id); where += ` AND d.pasta_id = $${params.length}`; }
    if (categoria_id) { params.push(categoria_id); where += ` AND d.categoria_id = $${params.length}`; }
    params.push(limit, offset);

    const result = await pool.query(
      `SELECT d.*, c.nome as categoria_nome FROM documents d
       LEFT JOIN categories c ON d.categoria_id = c.id WHERE ${where}
       ORDER BY d.criado_em DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar documentos' });
  }
};
