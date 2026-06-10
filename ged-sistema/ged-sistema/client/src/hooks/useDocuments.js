import { useState, useEffect } from 'react';
import api from '../services/api';

export function useDocuments(filters = {}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(filters).toString();
    api.get(`/documents?${params}`)
      .then(r => setDocuments(r.data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  return { documents, loading };
}

export function useDocument(id) {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/documents/${id}`)
      .then(r => setDocument(r.data))
      .catch(() => setDocument(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { document, loading };
}
