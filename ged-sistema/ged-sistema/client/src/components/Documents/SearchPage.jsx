import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('Todos');
  const navigate = useNavigate();

  const doSearch = async (q) => {
    if (!q.trim()) return;
    try {
      const { data } = await api.get(`/documents/search?q=${encodeURIComponent(q)}`);
      setResults(data.documents || []);
      setTotal(data.total || 0);
    } catch { setResults([]); }
  };

  useEffect(() => { if (query) doSearch(query); }, []);

  const handleSearch = () => doSearch(query);

  return (
    <>
      <TopBar title="Busca de Documentos" />
      <div className="content">
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 16, display: 'flex', gap: 8 }}>
            <input className="form-input" style={{ flex: 1 }} value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Pesquisar por conteúdo, título, palavra-chave..." />
            <button className="btn btn-primary" onClick={handleSearch}>Buscar</button>
          </div>
        </div>
        <div className="filter-pills">
          {['Todos', 'PDF', 'Imagem', 'Recentes'].map(f => (
            <button key={f} className={`pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="card">
          <div className="result-count">{total} documentos encontrados</div>
          {results.map(doc => (
            <div key={doc.id} className="search-result" onClick={() => navigate(`/documentos/${doc.id}`)}>
              <h4>{doc.titulo}</h4>
              {doc.trecho && <div className="snippet" dangerouslySetInnerHTML={{ __html: doc.trecho }} />}
              <div className="meta-row">
                <span className="badge badge-primary">{doc.formato}</span>
                <span>{doc.categoria_nome}</span>
                <span>{new Date(doc.criado_em).toLocaleDateString('pt-BR')}</span>
                {doc.ocr_confianca && <span className="badge badge-success">OCR {doc.ocr_confianca}%</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
