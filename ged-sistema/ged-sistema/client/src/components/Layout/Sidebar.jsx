import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiUpload, FiSearch, FiFolder, FiFileText, FiEdit, FiClock, FiUsers, FiBarChart2, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { section: 'PRINCIPAL', items: [
    { to: '/', icon: FiGrid, label: 'Dashboard' },
    { to: '/upload', icon: FiUpload, label: 'Upload', roles: ['admin','operador'] },
    { to: '/busca', icon: FiSearch, label: 'Busca' },
  ]},
  { section: 'ORGANIZAÇÃO', items: [
    { to: '/pastas', icon: FiFolder, label: 'Pastas' },
    { to: '/documentos', icon: FiFileText, label: 'Visualizador' },
    { to: '/metadados', icon: FiEdit, label: 'Metadados', roles: ['admin','operador'] },
    { to: '/versoes', icon: FiClock, label: 'Versões' },
  ]},
  { section: 'ADMINISTRAÇÃO', items: [
    { to: '/usuarios', icon: FiUsers, label: 'Usuários', roles: ['admin'] },
    { to: '/relatorios', icon: FiBarChart2, label: 'Relatórios', roles: ['admin'] },
    { to: '/notificacoes', icon: FiBell, label: 'Notificações' },
  ]},
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">G</div>
        <div><h1>GED</h1><span>Sistema v1.0</span></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section} className="nav-section">
            <div className="nav-section-title">{section.section}</div>
            {section.items
              .filter(item => !item.roles || item.roles.includes(user?.perfil))
              .map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <item.icon size={18} />
                  {item.label}
                  {item.label === 'Notificações' && <span className="nav-badge">5</span>}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">{user?.nome?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
        <div className="user-info">
          <div className="name">{user?.nome}</div>
          <div className="role">{user?.perfil}</div>
        </div>
      </div>
    </aside>
  );
}
