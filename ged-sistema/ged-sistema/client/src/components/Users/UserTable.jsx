import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import UserForm from './UserForm';

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const loadUsers = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {});
  useEffect(() => { loadUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Desativar este usuário?')) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  return (
    <>
      <TopBar title="Gerenciamento de Usuários" />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>{users.length} usuários cadastrados</h3>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditUser(null); setShowForm(true); }}>+ Novo Usuário</button>
        </div>
        {showForm && <UserForm user={editUser} onClose={() => { setShowForm(false); loadUsers(); }} />}
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Último Login</th><th>Ações</th></tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{u.nome}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.perfil === 'admin' ? 'primary' : u.perfil === 'operador' ? 'warning' : 'muted'}`}>{u.perfil}</span></td>
                    <td><span className={`badge badge-${u.status === 'ativo' ? 'success' : 'danger'}`}>{u.status}</span></td>
                    <td>{u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('pt-BR') : '—'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditUser(u); setShowForm(true); }}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
