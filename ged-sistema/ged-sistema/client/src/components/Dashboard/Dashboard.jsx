import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import StatsCards from './StatsCards';
import MonthlyChart from './MonthlyChart';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

const actionLabels = { upload: 'enviou', download: 'baixou', delete: 'excluiu', edit: 'editou', login: 'fez login', search: 'buscou', permission: 'alterou permissão', ocr: 'processou OCR' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const storageBytes = stats?.storage_bytes || 0;
  const storageLimit = 10 * 1024 * 1024 * 1024;
  const storagePct = Math.min((storageBytes / storageLimit) * 100, 100);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="content">
        <StatsCards stats={stats} />
        <div className="grid-3-1">
          <MonthlyChart data={stats?.monthly} />
          <div className="card">
            <div className="card-header"><h3>Atividade Recente</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
                <p className="text-muted" style={{ padding: 20 }}>Nenhuma atividade recente</p>
              ) : (
                stats.recent_activity.map((a, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderBottom: '1px solid #2a2d3a', fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{a.usuario_nome || 'Sistema'}</span>
                    <span className="text-muted"> {actionLabels[a.acao] || a.acao} </span>
                    {a.documento_titulo && <span style={{ color: '#4f7df9' }}>{a.documento_titulo}</span>}
                    <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {new Date(a.criado_em).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Armazenamento Local</h3>
            <span className="text-muted">{formatBytes(storageBytes)} / {formatBytes(storageLimit)}</span>
          </div>
          <div className="card-body">
            <div className="progress"><div className="progress-fill" style={{ width: `${storagePct}%` }} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
