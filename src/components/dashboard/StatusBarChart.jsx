// src/components/dashboard/StatusBarChart.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './StatusBarChart.module.css';

function StatusBarChart({ data }) {
  const [filterType, setFilterType] = useState('all');
  
  if (!data || data.length === 0) return <div>No hay datos disponibles para la gráfica</div>;

  // Filtra los datos según el tipo seleccionado
  const filteredData = filterType === 'all' 
    ? data 
    : data.filter(item => item.type === filterType || item.region === filterType);

  // Extrae tipos o regiones únicas para el filtro
  const filterOptions = [...new Set(data.map(item => item.type || item.region))];

  return (
    <div className={styles.chartContainer}>
      <div className={styles.filterContainer}>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className={styles.filter}
        >
          <option value="all">Todos</option>
          {filterOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="vigente" name="Vigente" fill="#28a745" />
          <Bar dataKey="vencido" name="Vencido" fill="#dc3545" />
          <Bar dataKey="porVencer" name="Por Vencer" fill="#ffc107" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StatusBarChart;