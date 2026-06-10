import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function DocumentViewer() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/documents/${id}`).then(r => setDoc(r.data)).catch(() => navigate('/'));
  }, [id, navigate]);

  const handleDownload = async () => {
    try {
      const { data } = await api.get(`/documents/${id}/download`);
      window.open(data.url, '_blank');
    } catch (err) { console.error(err); }
  };

  if (!doc) return <div className="content"><p>Carregando...</p></div>;

  return (
    <>
      <TopBar title="Visualizar Documento" />
      <div className="content" style={{ padding: 16 }}>
        <div className="viewer-layout">
          <div className="viewer-pdf">
            <div className="viewer-toolbar">
              <div className="page-nav">
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))}>◀</button>
                <span>Pág. {page} / 5</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)}>▶</button>
              </div>
              <div className="zoom-ctrl">
                <span>100%</span>
                <button className="btn btn-success btn-sm" onClick={handleDownload}>⬇ Download</button>
              </div>
            </div>
            <div className="viewer-content">
              <div className="pdf-page">
                <h3>{doc.titulo}</h3>
                <hr />
                {doc.ocr_texto ? <p>{doc.ocr_texto.slice(0, 500)}...</p> : <p className="text-muted">Conteúdo do documento</p>}
              </div>
            </div>
          </div>
          <div className="viewer-details">
            <div className="detail-section">
              <h4>INFORMAÇÕES DO DOCUMENTO</h4>
              <div className="detail-item"><span className="label">Título</span><span className="value">{doc.titulo}</span></div>
              <div className="detail-item"><span className="label">Formato</span><span className="value"><span className="badge badge-primary">{doc.formato}</span></span></div>
              <div className="detail-item"><span className="label">Tamanho</span><span className="value">{(doc.tamanho / 1024 / 1024).toFixed(1)} MB</span></div>
              <div className="detail-item"><span className="label">Categoria</span><span className="value">{doc.categoria_nome || '-'}</span></div>
              <div className="detail-item"><span className="label">Autor</span><span className="value">{doc.autor || '-'}</span></div>
              <div className="detail-item"><span className="label">Data</span><span className="value">{doc.data_documento ? new Date(doc.data_documento).toLocaleDateString('pt-BR') : '-'}</span></div>
            </div>
            <div className="detail-section">
              <h4>VERSIONAMENTO</h4>
              <div className="detail-item"><span className="label">Versão</span><span className="value"><span className="badge badge-success">v{doc.versao_atual}.0</span></span></div>
            </div>
            <div className="detail-section">
              <h4>OCR</h4>
              <div className="detail-item"><span className="label">Status</span><span className="value"><span className={`badge badge-${doc.ocr_status === 'processado' ? 'success' : 'warning'}`}>{doc.ocr_status}</span></span></div>
              {doc.ocr_confianca && <div className="detail-item"><span className="label">Confiança</span><span className="value" style={{ color: '#10B981' }}>{doc.ocr_confianca}%</span></div>}
            </div>
            {doc.data_validade && (
              <div className="detail-section">
                <h4>VALIDADE</h4>
                <div className="detail-item"><span className="label">Vence em</span><span className="value">{new Date(doc.data_validade).toLocaleDateString('pt-BR')}</span></div>
              </div>
            )}
            <div style={{ padding: 16, display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/metadados/${id}`)}>✏️ Metadados</button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => navigate(`/versoes/${id}`)}>🕐 Versões</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
