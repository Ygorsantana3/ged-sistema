import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Gestão<br />Eletrônica de<br /><span>Documentos</span></h1>
        <p>Digitalização estruturada, indexação automatizada via OCR e armazenamento seguro para sua organização.</p>
        <div className="tech-badges">
          <div><strong>OCR</strong><span>Tesseract.js v5</span></div>
          <div><strong>PG</strong><span>PostgreSQL v16</span></div>
          <div><strong>JWT</strong><span>Auth segura</span></div>
        </div>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Bem-vindo</h2>
          <p className="sub">Faça login para acessar o sistema</p>
          {error && <div className="alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gedsistema.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Senha</label>
            <input className="form-input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <p className="forgot-link">Esqueceu a senha? <a href="/recuperar">Recuperar</a></p>
        </form>
      </div>
    </div>
  );
}
