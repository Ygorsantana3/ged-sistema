import React from 'react';

export default function StatsCards({ stats }) {
  const ocrPct = stats?.total_documentos ? Math.round((stats.ocr_processados / stats.total_documentos) * 100) : 0;
  const pendentes = (stats?.total_documentos || 0) - (stats?.ocr_processados || 0);

  const cards = [
    { label: 'Total de Documentos', value: stats?.total_documentos || 0, className: 'primary', change: stats?.uploads_mes ? `${stats.uploads_mes} este mês` : null },
    { label: 'OCR Processados', value: stats?.ocr_processados || 0, className: 'success', change: stats?.total_documentos ? `${ocrPct}% concluído` : null },
    { label: 'Pendentes de OCR', value: pendentes, className: 'warning', change: pendentes > 0 ? 'Aguardando processamento' : null },
    { label: 'Usuários Ativos', value: stats?.usuarios_ativos || 0, className: 'accent' },
  ];

  return (
    <div className="stats-grid">
      {cards.map(card => (
        <div key={card.label} className={`stat-card ${card.className}`}>
          <div className="label">{card.label}</div>
          <div className="value">{card.value.toLocaleString('pt-BR')}</div>
          {card.change && <div className="change">{card.change}</div>}
        </div>
      ))}
    </div>
  );
}
