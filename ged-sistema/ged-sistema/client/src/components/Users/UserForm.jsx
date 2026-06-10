import React, { useState } from 'react';
import api from '../../services/api';

export default function UserForm({ user, onClose }) {
  const [form, setForm] = useState({
    nome: user?.nome || '', email: user?.email || '',
    perfil: user?.perfil || 'consultor', status: user?.status || 'ativo', senha: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user) {
        await api.put(`/users/${user.id}`, form);
      } else {
        await api.post('/auth/register', form);
      }
      onClose();
    } catch (err) { alert(err.response?.data?.error || 'Erro'); }
  };

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header"><h3>{user ? 'Editar' : 'Novo'} Usuário</h3></div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nome *</label><input className="form-input" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required /></div>
            <div className="form-group"><label className="form-label">E-mail *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Perfil</label>
              <select className="form-select" value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                <option value="admin">Administrador</option><option value="operador">Operador</option><option value="consultor">Consultor</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Senha {user ? '(deixe vazio para manter)' : '*'}</label><input className="form-input" type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button className="btn btn-ghost" type="button" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit">Salvar</button></div>
        </form>
      </div>
    </div>
  );
}
