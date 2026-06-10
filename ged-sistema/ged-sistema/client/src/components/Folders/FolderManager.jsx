import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import FolderTree from './FolderTree';

export default function FolderManager() {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/folders').then(r => setFolders(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      api.get(`/documents?pasta_id=${selectedFolder}`).then(r => setDocuments(r.data)).catch(() => {});
    }
  }, [selectedFolder]);

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { nome: newFolderName, pasta_pai_id: selectedFolder });
      setNewFolderName('');
      const { data } = await api.get('/folders');
      setFolders(data);
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <TopBar title="Organização de Pastas" />
      <div className="content">
        <div className="folder-layout">
          <div>
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="card-header">
                <h3>Pastas</h3>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  const name = prompt('Nome da nova pasta:');
                  if (name) { setNewFolderName(name); setTimeout(createFolder, 0); }
                }}>+ Nova</button>
              </div>
            </div>
            <FolderTree folders={folders} selectedId={selectedFolder} onSelect={setSelectedFolder} />
          </div>
          <div className="card">
            <div className="card-header">
              <h3>{selectedFolder ? `Pasta selecionada` : 'Selecione uma pasta'}</h3>
              <span className="text-muted">{documents.length} documentos</span>
            </div>
            {documents.map(doc => (
              <div key={doc.id} className="doc-list-item" onClick={() => navigate(`/documentos/${doc.id}`)}>
                <div className="doc-icon pdf">📄</div>
                <div className="doc-info">
                  <div className="title">{doc.titulo}</div>
                  <div className="meta">v{doc.versao_atual} · {new Date(doc.criado_em).toLocaleDateString('pt-BR')} · {(doc.tamanho / 1024 / 1024).toFixed(1)} MB</div>
                </div>
                <button className="btn btn-ghost btn-sm">Abrir</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
