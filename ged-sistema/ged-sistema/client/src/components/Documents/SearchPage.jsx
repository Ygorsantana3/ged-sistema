import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [allDocs, setAllDocs] = useState([]);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('Todos');
  const navigate = useNavigate();

  const loadAll = async () => {
    try {
      const { data } = await api.get('/documents');
      setAllDocs(data);
      setResults(data);
      setTotal(data.length);
    } catch { setAllDocs([]); setResults([]); }
  };

  const doSearch = async (q) => {
    if (!q.trim()) { loadAll(); return; }
    try {
      const { data } = await api.get(`/documents/search?q=${encodeURIComponent(q)}`);
      setResults(data.documents || []);
      setTotal(data.total || 0);
    } catch { setResults([]); }
  };

  useEffect(() => {
    if (query) doSearch(query);
    else loadAll();
  }, []);

  const handleSearch = () => doSearch(query);

  const handleClear = () => {
    setQuery('');
    setFilter('Todos');
    loadAll();
  };

  const filtered = results.filter(doc => {
    if (filter === 'PDF') return doc.formato?.toUpperCase() === 'PDF';
    if (filter === 'Imagem') return ['JPG', 'JPEG', 'PNG', 'TIFF', 'TIF'].includes(doc.formato?.toUpperCase());
    if (filter === 'Recentes') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(doc.criado_em) >= weekAgo;
    }
    return true;
  });

  return (
    <>
      <TopBar title="Busca de Documentos" />
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 16, display: 'flex', gap: 8 }}>
            <input className="form-input" style={{ flex: 1 }} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Pesquisar por conteúdo, título, palavra-chave..." />
            <button className="btn btn-primary" onClick={handleSearch}>Buscar</button>
            {query && <button className="btn btn-ghost" onClick={handleClear}>Limpar</button>}
          </div>
        </div>
        <div className="filter-pills">
          {['Todos', 'PDF', 'Imagem', 'Recentes'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="card">
          <div className="result-count">{filtered.length} documento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</div>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#7B8CA3' }}>
              {query ? 'Nenhum documento encontrado para esta busca.' : 'Nenhum documento cadastrado.'}
            </div>
          )}
          {filtered.map(doc => (
            <div key={doc.id} className="search-result" onClick={() => navigate(`/documentos/${doc.id}`)}>
              <h4>{doc.titulo}</h4>
              {doc.descricao && <div className="snippet">{doc.descricao}</div>}
              {doc.trecho && <div className="snippet" dangerouslySetInnerHTML={{ __html: doc.trecho }} />}
              <div className="meta-row">
                <span className="badge badge-primary">{doc.formato}</span>
                {doc.categoria_nome && <span>{doc.categoria_nome}</span>}
                {doc.autor && <span>{doc.autor}</span>}
                <span>{new Date(doc.criado_em).toLocaleDateString('pt-BR')}</span>
                <span>{(doc.tamanho / 1024 / 1024).toFixed(1)} MB</span>
                {doc.ocr_confianca && <span className="badge badge-success">OCR {doc.ocr_confianca}%</span>}
                <span className={`badge badge-${doc.ocr_status === 'processado' ? 'success' : 'warning'}`}>{doc.ocr_status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
