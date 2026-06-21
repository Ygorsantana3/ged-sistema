import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ titulo: '', categoria_id: '', autor: '', palavras_chave: '', data_documento: '', data_validade: '', pasta_id: '' });
  const [ocrAuto, setOcrAuto] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/folders').then(r => setFolders(r.data)).catch(() => {});
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/tiff': ['.tiff', '.tif'] },
    maxSize: 50 * 1024 * 1024,
    onDrop: (accepted) => { if (accepted.length) setFile(accepted[0]); },
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!file || !formData.titulo) return setMessage({ text: 'Arquivo e título são obrigatórios', type: 'error' });
    setUploading(true);
    setMessage({ text: '', type: '' });
    const data = new FormData();
    data.append('file', file);
    Object.entries(formData).forEach(([k, v]) => { if (v) data.append(k, v); });
    data.append('ocr_auto', ocrAuto);
    try {
      await api.post('/documents/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage({ text: 'Documento enviado com sucesso!', type: 'success' });
      setFile(null);
      setFormData({ titulo: '', categoria_id: '', autor: '', palavras_chave: '', data_documento: '', data_validade: '', pasta_id: '' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Erro ao enviar documento', type: 'error' });
    } finally { setUploading(false); }
  };

  return (
    <>
      <TopBar title="Upload de Documentos" />
      <div className="content">
        <div className="card">
          <div className="card-header"><h3>Upload de Documentos</h3></div>
          <div className="card-body">
            <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {file ? <p>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p> : (
                <><h4>Arraste arquivos aqui ou clique para selecionar</h4><p>PDF, JPEG, PNG, TIFF — máximo 50 MB</p></>
              )}
            </div>
            {message.text && <div className={message.type === 'success' ? 'alert' : 'alert-error'}>{message.text}</div>}
            <div className="form-row">
              <div className="form-group"><label className="form-label">Título *</label><input className="form-input" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Nome do documento" /></div>
              <div className="form-group"><label className="form-label">Categoria</label>
                <select className="form-select" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                  <option value="">Selecione uma categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Autor</label><input className="form-input" name="autor" value={formData.autor} onChange={handleChange} placeholder="Nome do autor" /></div>
              <div className="form-group"><label className="form-label">Pasta</label>
                <select className="form-select" name="pasta_id" value={formData.pasta_id} onChange={handleChange}>
                  <option value="">Nenhuma pasta</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Data do Documento</label><input className="form-input" name="data_documento" type="date" value={formData.data_documento} onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Data de Validade</label><input className="form-input" name="data_validade" type="date" value={formData.data_validade} onChange={handleChange} /></div>
            </div>
            <div className="form-group"><label className="form-label">Palavras-chave</label><input className="form-input" name="palavras_chave" value={formData.palavras_chave} onChange={handleChange} placeholder="Separe por vírgulas" /></div>
            <div className="checkbox-group">
              <input type="checkbox" id="ocr-auto" checked={ocrAuto} onChange={e => setOcrAuto(e.target.checked)} />
              <label htmlFor="ocr-auto">Processar OCR automaticamente</label>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => { setFile(null); setMessage({ text: '', type: '' }); }}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={uploading}>{uploading ? 'Enviando...' : 'Enviar Documento'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
