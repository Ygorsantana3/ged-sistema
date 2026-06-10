import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentList from './components/Documents/DocumentList';
import DocumentViewer from './components/Documents/DocumentViewer';
import UploadForm from './components/Documents/UploadForm';
import SearchPage from './components/Documents/SearchPage';
import FolderManager from './components/Folders/FolderManager';
import UserTable from './components/Users/UserTable';
import AuditLog from './components/Reports/AuditLog';
import NotificationList from './components/Notifications/NotificationList';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="documentos" element={<DocumentList />} />
            <Route path="documentos/:id" element={<DocumentViewer />} />
            <Route path="upload" element={<ProtectedRoute roles={['admin','operador']}><UploadForm /></ProtectedRoute>} />
            <Route path="busca" element={<SearchPage />} />
            <Route path="pastas" element={<FolderManager />} />
            <Route path="usuarios" element={<ProtectedRoute roles={['admin']}><UserTable /></ProtectedRoute>} />
            <Route path="relatorios" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
            <Route path="notificacoes" element={<NotificationList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
