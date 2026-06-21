import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

const now = new Date();
const yearStart = `${now.getFullYear()}-01-01`;
const yearEnd = `${now.getFullYear()}-12-31`;

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ inicio: yearStart, fim: yearEnd, acao: '' });

  const loadData = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const [logsRes, statsRes] = await Promise.all([
        api.get(`/reports/audit?${params}`),
        api.get('/reports/stats'),
      ]);
      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch { }
  };

  useEffect(() => { loadData(); }, []);

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/reports/audit/csv?${params}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `auditoria_${filters.inicio}_${filters.fim}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert('Erro ao exportar CSV');
    }
  };

  const actionColors = { upload: 'success', download: 'primary', delete: 'danger', edit: 'muted', login: 'primary', search: 'muted', permission: 'warning', ocr: 'muted' };

  return (
    <>
      <TopBar title="Relatórios e Auditoria" />
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="text-muted">Período:</span>
            <input className="form-input" type="date" value={filters.inicio} onChange={e => setFilters({ ...filters, inicio: e.target.value })} style={{ width: 140, padding: '6px 10px' }} />
            <span className="text-muted">a</span>
            <input className="form-input" type="date" value={filters.fim} onChange={e => setFilters({ ...filters, fim: e.target.value })} style={{ width: 140, padding: '6px 10px' }} />
            <select className="form-select" value={filters.acao} onChange={e => setFilters({ ...filters, acao: e.target.value })} style={{ width: 130, padding: '6px 10px' }}>
              <option value="">Todas ações</option>
              <option value="upload">Upload</option>
              <option value="download">Download</option>
              <option value="delete">Exclusão</option>
              <option value="edit">Edição</option>
              <option value="login">Login</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={loadData}>Filtrar</button>
            <button className="btn btn-success btn-sm" style={{ marginLeft: 'auto' }} onClick={handleExportCSV}>⬇ CSV</button>
          </div>
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 16 }}>
          <div className="stat-card primary"><div className="label">Total de Ações</div><div className="value">{logs.length}</div></div>
          <div className="stat-card success"><div className="label">Uploads no Período</div><div className="value">{stats?.uploads_mes || 0}</div></div>
          <div className="stat-card accent"><div className="label">Documentos</div><div className="value">{stats?.total_documentos || 0}</div></div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Ação</th><th>Documento</th><th>IP</th></tr></thead>
              <tbody>
                {logs.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: 24, color: '#7B8CA3' }}>Nenhum registro de auditoria no período</td></tr>
                )}
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.criado_em).toLocaleString('pt-BR')}</td>
                    <td>{log.usuario_nome || 'Sistema'}</td>
                    <td><span className={`badge badge-${actionColors[log.acao] || 'muted'}`}>{log.acao}</span></td>
                    <td>{log.documento_titulo || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.ip_address || '—'}</td>
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
