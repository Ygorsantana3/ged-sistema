import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import { useAuth } from '../../context/AuthContext';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [viewMode, setViewMode] = useState('ativos');
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = ['admin', 'operador'].includes(user?.perfil);

  const loadDocs = (mode) => {
    const status = mode || viewMode;
    const params = status === 'inativos' ? '?status=inativo' : '';
    api.get(`/documents${params}`).then(r => setDocuments(r.data)).catch(() => {});
  };

  useEffect(() => { loadDocs(); }, [viewMode]);

  const handleInativar = async (e, doc) => {
    e.stopPropagation();
    if (!window.confirm(`Inativar o documento "${doc.titulo}"?`)) return;
    try {
      await api.put(`/documents/${doc.id}/inactivate`);
      loadDocs();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao inativar documento');
    }
  };

  const handleReativar = async (e, doc) => {
    e.stopPropagation();
    try {
      await api.put(`/documents/${doc.id}/reactivate`);
      loadDocs();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao reativar documento');
    }
  };

  const handleToggle = (mode) => {
    setViewMode(mode);
    loadDocs(mode);
  };

  return (
    <>
      <TopBar title="Documentos" />
      <div className="content">
        <div className="filter-pills" style={{ marginBottom: 16 }}>
          <button className={`pill ${viewMode === 'ativos' ? 'active' : ''}`} onClick={() => handleToggle('ativos')}>Ativos</button>
          <button className={`pill ${viewMode === 'inativos' ? 'active' : ''}`} onClick={() => handleToggle('inativos')}>Inativos</button>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>{viewMode === 'ativos' ? 'Documentos Ativos' : 'Documentos Inativos'}</h3>
            <span className="text-muted">{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
          </div>
          {documents.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#7B8CA3' }}>
              {viewMode === 'ativos' ? 'Nenhum documento ativo' : 'Nenhum documento inativo'}
            </div>
          )}
          {documents.map(doc => (
            <div key={doc.id} className="doc-list-item" onClick={() => viewMode === 'ativos' ? navigate(`/documentos/${doc.id}`) : null} style={viewMode === 'inativos' ? { opacity: 0.7 } : {}}>
              <div className="doc-icon pdf">📄</div>
              <div className="doc-info">
                <div className="title">{doc.titulo}</div>
                <div className="meta">
                  v{doc.versao_atual} · {new Date(doc.criado_em).toLocaleDateString('pt-BR')} · {(doc.tamanho / 1024 / 1024).toFixed(1)} MB
                  {doc.excluido_em && <span> · Inativado em {new Date(doc.excluido_em).toLocaleDateString('pt-BR')}</span>}
                </div>
              </div>
              <span className={`badge badge-${doc.ocr_status === 'processado' ? 'success' : 'warning'}`}>{doc.ocr_status}</span>
              {canManage && viewMode === 'ativos' && (
                <button className="btn btn-danger btn-sm" onClick={(e) => handleInativar(e, doc)}>Inativar</button>
              )}
              {canManage && viewMode === 'inativos' && (
                <button className="btn btn-success btn-sm" onClick={(e) => handleReativar(e, doc)}>Reativar</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
