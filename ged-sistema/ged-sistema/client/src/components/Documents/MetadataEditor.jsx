import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function MetadataEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    titulo: '', descricao: '', categoria_id: '', autor: '',
    palavras_chave: '', data_documento: '', data_validade: '', pasta_id: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/documents/${id}`).then(r => {
        setSelected(r.data);
        populateForm(r.data);
      }).catch(() => navigate('/metadados'));
    } else {
      api.get('/documents').then(r => setDocuments(r.data)).catch(() => {});
    }
  }, [id, navigate]);

  const populateForm = (doc) => {
    setForm({
      titulo: doc.titulo || '',
      descricao: doc.descricao || '',
      categoria_id: doc.categoria_id || '',
      autor: doc.autor || '',
      palavras_chave: Array.isArray(doc.palavras_chave) ? doc.palavras_chave.join(', ') : (doc.palavras_chave || ''),
      data_documento: doc.data_documento ? doc.data_documento.split('T')[0] : '',
      data_validade: doc.data_validade ? doc.data_validade.split('T')[0] : '',
      pasta_id: doc.pasta_id || ''
    });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.put(`/documents/${id}/metadata`, form);
      setMessage('Metadados atualizados com sucesso!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Erro ao atualizar metadados');
    } finally { setSaving(false); }
  };

  if (!id) {
    return (
      <>
        <TopBar title="Metadados" />
        <div className="content">
          <div className="card">
            <div className="card-header"><h3>Selecione um documento para editar metadados</h3></div>
            {documents.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#7B8CA3' }}>Nenhum documento encontrado</div>
            )}
            {documents.map(doc => (
              <div key={doc.id} className="doc-list-item" onClick={() => navigate(`/metadados/${doc.id}`)}>
                <div className="doc-icon">📄</div>
                <div className="doc-info">
                  <div className="title">{doc.titulo}</div>
                  <div className="meta">
                    {doc.autor || 'Sem autor'} · {doc.formato} · {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm">Editar</button>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Editar Metadados" />
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Voltar</button>
          {selected && <span className="text-muted">Documento: {selected.titulo}</span>}
        </div>
        <div className="card">
          <div className="card-header"><h3>Metadados do Documento</h3></div>
          <div className="card-body">
            {message && <div className={message.includes('sucesso') ? 'alert' : 'alert-error'}>{message}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input className="form-input" name="titulo" value={form.titulo} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Autor</label>
                <input className="form-input" name="autor" value={form.autor} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" name="descricao" value={form.descricao} onChange={handleChange}
                rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data do Documento</label>
                <input className="form-input" name="data_documento" type="date" value={form.data_documento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Validade</label>
                <input className="form-input" name="data_validade" type="date" value={form.data_validade} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Palavras-chave</label>
              <input className="form-input" name="palavras_chave" value={form.palavras_chave} onChange={handleChange}
                placeholder="Separe por vírgulas" />
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Metadados'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
