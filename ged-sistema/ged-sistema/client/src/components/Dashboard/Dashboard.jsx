import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TopBar from '../Layout/TopBar';
import StatsCards from './StatsCards';
import MonthlyChart from './MonthlyChart';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="content">
        <StatsCards stats={stats} />
        <div className="grid-3-1">
          <MonthlyChart data={stats?.monthly} />
          <div className="card">
            <div className="card-header"><h3>Atividade Recente</h3></div>
            <div className="card-body">
              <p className="text-muted">Nenhuma atividade recente</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3>Armazenamento AWS S3</h3>
            <span className="text-muted">{stats?.storage_used || '0 GB'} / 50 GB</span>
          </div>
          <div className="card-body">
            <div className="progress"><div className="progress-fill" style={{ width: '24.8%' }} /></div>
          </div>
        </div>
      </div>
    </>
  );
}
