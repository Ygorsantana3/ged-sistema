import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function MonthlyChart({ data }) {
  const chartData = months.map((m, i) => ({ name: m, docs: data?.[i] || 0 }));

  return (
    <div className="card">
      <div className="card-header"><h3>Documentos por Mês</h3></div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
            <XAxis dataKey="name" stroke="#7B8CA3" fontSize={11} />
            <YAxis stroke="#7B8CA3" fontSize={11} />
            <Tooltip />
            <Bar dataKey="docs" fill="#4f7df9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
