import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:3001/api').replace('/api', '');

function getFileUrl(urlPath) {
  if (!urlPath) return '';
  return urlPath.startsWith('http') ? urlPath : `${API_BASE}${urlPath}`;
}

export default function DocumentViewer() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [zoom, setZoom] = useState(100);
  const navigate = useNavigate();
  const { user } = useAuth();
  const canDelete = ['admin', 'operador'].includes(user?.perfil);

  useEffect(() => {
    api.get(`/documents/${id}`).then(r => setDoc(r.data)).catch(() => navigate('/documentos'));
    api.get(`/documents/${id}/download`).then(r => {
      setFileUrl(getFileUrl(r.data.url));
    }).catch(() => {});
  }, [id, navigate]);

  const handleView = () => {
    if (fileUrl) window.open(fileUrl, '_blank');
  };

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${doc.titulo}.${doc.formato.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(fileUrl, '_blank');
    }
  };

  if (!doc) return <div className="content"><p>Carregando...</p></div>;

  const isImage = ['JPG', 'JPEG', 'PNG', 'TIFF', 'TIF'].includes(doc.formato?.toUpperCase());
  const isPdf = doc.formato?.toUpperCase() === 'PDF';

  return (
    <>
      <TopBar title="Visualizar Documento" />
      <div className="content" style={{ padding: 16 }}>
        <div className="viewer-layout">
          <div className="viewer-pdf">
            <div className="viewer-toolbar">
              <div className="page-nav">
                <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.max(50, z - 25))}>−</button>
                <span>{zoom}%</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setZoom(z => Math.min(200, z + 25))}>+</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setZoom(100)} style={{ marginLeft: 4, fontSize: 11 }}>Reset</button>
              </div>
              <div className="zoom-ctrl">
                <button className="btn btn-primary btn-sm" onClick={handleView}>🔍 Visualizar</button>
                <button className="btn btn-success btn-sm" onClick={handleDownload}>⬇ Baixar</button>
                {canDelete && (
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    if (!window.confirm(`Inativar o documento "${doc.titulo}"?`)) return;
                    try { await api.put(`/documents/${id}/inactivate`); navigate('/documentos'); } catch { alert('Erro ao inativar'); }
                  }}>Inativar</button>
                )}
              </div>
            </div>
            <div className="viewer-content">
              {fileUrl ? (
                isPdf ? (
                  <iframe
                    src={fileUrl}
                    title={doc.titulo}
                    style={{
                      width: `${zoom}%`,
                      height: '100%',
                      minHeight: 600,
                      border: 'none',
                      background: '#fff',
                      borderRadius: 6,
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                ) : isImage ? (
                  <div style={{ textAlign: 'center', padding: 16, overflow: 'auto' }}>
                    <img
                      src={fileUrl}
                      alt={doc.titulo}
                      style={{
                        maxWidth: `${zoom}%`,
                        height: 'auto',
                        borderRadius: 6,
                        boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                      }}
                    />
                  </div>
                ) : (
                  <div className="pdf-page">
                    <h3>{doc.titulo}</h3>
                    <hr />
                    <p className="text-muted">Preview não disponível para este formato. Use os botões acima para visualizar ou baixar.</p>
                  </div>
                )
              ) : (
                <div className="pdf-page">
                  <h3>{doc.titulo}</h3>
                  <hr />
                  {doc.ocr_texto ? (
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8 }}>{doc.ocr_texto}</pre>
                  ) : (
                    <p className="text-muted">Carregando preview...</p>
                  )}
                </div>
              )}
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
              <div className="detail-item"><span className="label">Criado em</span><span className="value">{new Date(doc.criado_em).toLocaleDateString('pt-BR')}</span></div>
            </div>
            <div className="detail-section">
              <h4>VERSIONAMENTO</h4>
              <div className="detail-item"><span className="label">Versão</span><span className="value"><span className="badge badge-success">v{doc.versao_atual}</span></span></div>
            </div>
            <div className="detail-section">
              <h4>OCR</h4>
              <div className="detail-item"><span className="label">Status</span><span className="value"><span className={`badge badge-${doc.ocr_status === 'processado' ? 'success' : 'warning'}`}>{doc.ocr_status}</span></span></div>
              {doc.ocr_confianca && <div className="detail-item"><span className="label">Confiança</span><span className="value" style={{ color: '#10B981' }}>{doc.ocr_confianca}%</span></div>}
            </div>
            {doc.ocr_texto && (
              <div className="detail-section">
                <h4>TEXTO EXTRAÍDO (OCR)</h4>
                <div style={{ fontSize: 12, color: '#9ca3af', maxHeight: 150, overflowY: 'auto', lineHeight: 1.6 }}>
                  {doc.ocr_texto.slice(0, 300)}{doc.ocr_texto.length > 300 ? '...' : ''}
                </div>
              </div>
            )}
            {doc.data_validade && (
              <div className="detail-section">
                <h4>VALIDADE</h4>
                <div className="detail-item"><span className="label">Vence em</span><span className="value">{new Date(doc.data_validade).toLocaleDateString('pt-BR')}</span></div>
              </div>
            )}
            {doc.palavras_chave && doc.palavras_chave.length > 0 && (
              <div className="detail-section">
                <h4>PALAVRAS-CHAVE</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 0' }}>
                  {doc.palavras_chave.map((kw, i) => (
                    <span key={i} className="badge badge-muted">{kw}</span>
                  ))}
                </div>
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
