const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'ged-sistema-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND status = $2', [email, 'ativo']);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    await pool.query('UPDATE users SET ultimo_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, perfil: user.perfil }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const senha_hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO users (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil, criado_em',
      [nome, email, senha_hash, perfil || 'consultor']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};
