import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function VersionList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/documents/${id}`).then(r => setDoc(r.data)).catch(() => navigate('/versoes'));
      api.get(`/documents/${id}/versions`).then(r => setVersions(r.data)).catch(() => {});
    } else {
      api.get('/documents').then(r => setDocuments(r.data)).catch(() => {});
    }
  }, [id, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/tiff': ['.tiff', '.tif'] },
    maxSize: 50 * 1024 * 1024,
    onDrop: (accepted) => { if (accepted.length) setFile(accepted[0]); },
  });

  const handleUploadVersion = async () => {
    if (!file) return;
    setUploading(true);
    setMessage('');
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post(`/documents/${id}/versions`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`Versão ${res.data.versao} criada com sucesso!`);
      setFile(null);
      setShowUpload(false);
      api.get(`/documents/${id}/versions`).then(r => setVersions(r.data));
      api.get(`/documents/${id}`).then(r => setDoc(r.data));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao criar versão');
    } finally { setUploading(false); }
  };

  if (!id) {
    return (
      <>
        <TopBar title="Versionamento" />
        <div className="content">
          <div className="card">
            <div className="card-header"><h3>Selecione um documento para ver versões</h3></div>
            {documents.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#7B8CA3' }}>Nenhum documento encontrado</div>
            )}
            {documents.map(d => (
              <div key={d.id} className="doc-list-item" onClick={() => navigate(`/versoes/${d.id}`)}>
                <div className="doc-icon">📄</div>
                <div className="doc-info">
                  <div className="title">{d.titulo}</div>
                  <div className="meta">Versão atual: v{d.versao_atual} · {d.formato} · {new Date(d.criado_em).toLocaleDateString('pt-BR')}</div>
                </div>
                <span className="badge badge-primary">v{d.versao_atual}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Histórico de Versões" />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Voltar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(!showUpload)}>+ Nova Versão</button>
        </div>

        {doc && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="doc-icon">📄</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{doc.titulo}</div>
                <div className="text-muted">Versão atual: v{doc.versao_atual} · {doc.formato} · {(doc.tamanho / 1024 / 1024).toFixed(1)} MB</div>
              </div>
            </div>
          </div>
        )}

        {message && <div className={message.includes('sucesso') ? 'alert' : 'alert-error'} style={{ marginBottom: 16 }}>{message}</div>}

        {showUpload && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><h3>Enviar Nova Versão</h3></div>
            <div className="card-body">
              <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {file ? <p>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p> : (
                  <><h4>Arraste o novo arquivo ou clique para selecionar</h4><p>PDF, JPEG, PNG, TIFF — máximo 50 MB</p></>
                )}
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => { setShowUpload(false); setFile(null); }}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleUploadVersion} disabled={!file || uploading}>
                  {uploading ? 'Enviando...' : 'Criar Versão'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Histórico</h3>
            <span className="text-muted">{versions.length} versões</span>
          </div>
          {versions.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#7B8CA3' }}>
              Nenhuma versão anterior registrada. A versão atual é v{doc?.versao_atual || 1}.
            </div>
          )}
          {versions.map(v => (
            <div key={v.id} className="doc-list-item">
              <div style={{ width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: v.numero_versao === doc?.versao_atual ? 'rgba(79,125,249,0.15)' : 'rgba(123,140,163,0.1)', color: v.numero_versao === doc?.versao_atual ? '#4f7df9' : '#7B8CA3' }}>
                v{v.numero_versao}
              </div>
              <div className="doc-info">
                <div className="title">
                  Versão {v.numero_versao}
                  {v.numero_versao === doc?.versao_atual && <span className="badge badge-primary" style={{ marginLeft: 8 }}>Atual</span>}
                </div>
                <div className="meta">
                  {v.criado_por_nome || 'Sistema'} · {new Date(v.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {(v.tamanho / 1024 / 1024).toFixed(1)} MB
                </div>
              </div>
              {v.notas && <span className="text-muted" style={{ fontSize: 12 }}>{v.notas}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
