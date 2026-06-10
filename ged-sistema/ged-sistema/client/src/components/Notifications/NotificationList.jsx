import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('Todas');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const filtered = notifications.filter(n => {
    if (filter === 'Não lidas') return !n.lida;
    if (filter === 'Vencimentos') return n.tipo?.includes('vencimento');
    if (filter === 'Sistema') return n.tipo === 'sistema';
    return true;
  });

  const iconMap = { 'vencimento_7d': '⚠️', 'vencimento_15d': '⚠️', 'vencimento_30d': '⚠️', 'ocr_concluido': '✅', 'nova_versao': 'ℹ️', 'upload': '✅' };

  return (
    <>
      <TopBar title="Notificações" />
      <div className="content">
        <div className="filter-pills">
          {['Todas', 'Não lidas', 'Vencimentos', 'Sistema'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="card">
          {filtered.map(n => (
            <div key={n.id} className={`notif-item ${!n.lida ? 'unread' : ''}`}>
              <div className={`notif-icon ${n.tipo?.includes('vencimento') ? 'warn' : 'ok'}`}>
                {iconMap[n.tipo] || 'ℹ️'}
              </div>
              <div className="notif-content">
                <h4>{n.titulo}</h4>
                <p>{n.mensagem}</p>
                <div className="time">{new Date(n.criado_em).toLocaleDateString('pt-BR')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {n.documento_id && <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/documentos/${n.documento_id}`)}>Ver doc.</button>}
                {!n.lida && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Marcar lida</button>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#7B8CA3' }}>Nenhuma notificação</div>}
        </div>
      </div>
    </>
  );
}
