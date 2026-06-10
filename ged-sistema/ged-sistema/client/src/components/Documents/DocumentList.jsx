import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/documents').then(r => setDocuments(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <TopBar title="Documentos" />
      <div className="content">
        <div className="card">
          <div className="card-header"><h3>Todos os Documentos</h3></div>
          {documents.map(doc => (
            <div key={doc.id} className="doc-list-item" onClick={() => navigate(`/documentos/${doc.id}`)}>
              <div className="doc-icon pdf">📄</div>
              <div className="doc-info">
                <div className="title">{doc.titulo}</div>
                <div className="meta">v{doc.versao_atual} · {new Date(doc.criado_em).toLocaleDateString('pt-BR')} · {(doc.tamanho / 1024 / 1024).toFixed(1)} MB</div>
              </div>
              <span className={`badge badge-${doc.ocr_status === 'processado' ? 'success' : 'warning'}`}>{doc.ocr_status}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
