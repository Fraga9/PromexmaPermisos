// src/components/dashboard/StatusBarChart.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import styles from './StatusBarChart.module.css';

function StatusBarChart({ data }) {
  const [filterType, setFilterType] = useState('all');
  
  if (!data || data.length === 0) {
    return (
      <div className={styles.noDataContainer}>
        <div className={styles.noDataContent}>
          <i className="fas fa-chart-bar"></i>
          <p>No hay datos disponibles para la gráfica</p>
        </div>
      </div>
    );
  }
  
  // Transforma los datos para que coincidan con los nombres de propiedad esperados
  const formattedData = data.map(item => ({
    name: item.region,
    region: item.region,
    vigente: item.green,
    porVencer: item.yellow,
    vencido: item.red
  }));

  // Filtra los datos según el tipo seleccionado
  const filteredData = filterType === 'all' 
    ? formattedData 
    : formattedData.filter(item => item.region === filterType);

  // Extrae regiones únicas para el filtro
  const filterOptions = [...new Set(data.map(item => item.region))];

  // Función personalizada para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{`Región: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <div className={styles.filterContainer}>
          <label htmlFor="regionFilter" className={styles.filterLabel}>Filtrar por región:</label>
          <select 
            id="regionFilter"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filter}
          >
            <option value="all">Todas las regiones</option>
            {filterOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
            barGap={8}
            barSize={30}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 10 }}
              iconType="circle"
            />
            <Bar 
              dataKey="vigente" 
              name="Vigente" 
              fill="#4CAF50" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
            <Bar 
              dataKey="porVencer" 
              name="Por Vencer" 
              fill="#FFC107" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={300}
            />
            <Bar 
              dataKey="vencido" 
              name="Vencido" 
              fill="#F44336" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationBegin={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default StatusBarChart;