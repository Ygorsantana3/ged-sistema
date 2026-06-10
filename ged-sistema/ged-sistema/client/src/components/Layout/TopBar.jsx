import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';

export default function TopBar({ title }) {
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/busca?q=${encodeURIComponent(e.target.value)}`);
    }
  };

  return (
    <div className="topbar">
      <h2>{title}</h2>
      <div className="topbar-search">
        <FiSearch size={16} />
        <input placeholder="Buscar documentos..." onKeyDown={handleSearch} />
      </div>
    </div>
  );
}
