// src/components/dashboard/WeightedRegionComplianceChart.jsx
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, ReferenceLine, Cell } from 'recharts';
import styles from './RegionComplianceChart.module.css';

function WeightedRegionComplianceChart({ data }) {
  const [filterType, setFilterType] = useState('all');
  const [showMode, setShowMode] = useState('weighted'); // 'weighted' o 'simple'
  
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
  
  // Transforma los datos para su uso en el gráfico
  const formattedData = data.map(item => ({
    name: item.region,
    porcentajeSimple: item.porcentaje_cumplimiento_simple,
    porcentajePonderado: item.porcentaje_cumplimiento,
    total: item.total_permisos,
    vigentes: item.permisos_vigentes,
    ponderacionTotal: item.ponderacion_total,
    ponderacionVigentes: item.ponderacion_vigentes
  }));

  // Filtra y ordena los datos según la región seleccionada
  const filteredData = (filterType === 'all' 
    ? formattedData 
    : formattedData.filter(item => item.name === filterType)
  ).sort((a, b) => {
    // Ordena de mayor a menor según el modo seleccionado
    const key = showMode === 'weighted' ? 'porcentajePonderado' : 'porcentajeSimple';
    return b[key] - a[key];
  });

  // Extrae regiones únicas para el filtro
  const filterOptions = [...new Set(data.map(item => item.region))];

  // Función personalizada para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isWeighted = showMode === 'weighted';
      const dataItem = payload[0].payload;
      
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{`Región: ${label}`}</p>
          {isWeighted ? (
            <>
              <p style={{ color: '#4285F4', fontWeight: 'bold' }}>{`Cumplimiento ponderado: ${dataItem.porcentajePonderado}%`}</p>
              <p style={{ color: '#333' }}>{`Ponderación vigente: ${dataItem.ponderacionVigentes} de ${dataItem.ponderacionTotal}`}</p>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>{`Cumplimiento simple: ${dataItem.porcentajeSimple}%`}</p>
            </>
          ) : (
            <>
              <p style={{ color: '#4285F4', fontWeight: 'bold' }}>{`Cumplimiento simple: ${dataItem.porcentajeSimple}%`}</p>
              <p style={{ color: '#333' }}>{`Permisos vigentes: ${dataItem.vigentes} de ${dataItem.total}`}</p>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>{`Cumplimiento ponderado: ${dataItem.porcentajePonderado}%`}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Función para determinar el color según el porcentaje de cumplimiento
  const getBarColor = (percent) => {
    if (percent >= 90) return '#4CAF50';
    if (percent >= 70) return '#FFC107';
    return '#F44336';
  };

  // Obtiene la clave de datos a usar según el modo seleccionado
  const dataKey = showMode === 'weighted' ? 'porcentajePonderado' : 'porcentajeSimple';
  
  return (
    <>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>
          Porcentaje de Cumplimiento por Región
          {showMode === 'weighted' ? ' (Ponderado)' : ' (Simple)'}
        </h2>
        <div className={styles.controlsContainer}>
          <div className={styles.filterContainer}>
            <label htmlFor="regionFilter" className={styles.filterLabel}>Región:</label>
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
          
          <div className={styles.filterContainer}>
            <label htmlFor="modeFilter" className={styles.filterLabel}>Tipo:</label>
            <select 
              id="modeFilter"
              value={showMode} 
              onChange={(e) => setShowMode(e.target.value)}
              className={styles.filter}
            >
              <option value="weighted">Cumplimiento Ponderado</option>
              <option value="simple">Cumplimiento Simple</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className={styles.infoBox}>
        {showMode === 'weighted' ? (
          <p className={styles.infoText}>
            <strong>Cumplimiento Ponderado:</strong> Considera la importancia relativa de cada permiso según su ponderación (1-3).
            Los permisos críticos (ponderación 3) tienen mayor impacto en este cálculo.
          </p>
        ) : (
          <p className={styles.infoText}>
            <strong>Cumplimiento Simple:</strong> Muestra el porcentaje de permisos vigentes independientemente de su importancia relativa.
          </p>
        )}
      </div>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
            barSize={40}
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
              domain={[0, 100]}
              label={{ 
                value: 'Porcentaje de Cumplimiento (%)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fill: '#666', fontSize: 12 } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            
            {/* Líneas de referencia para umbrales */}
            <ReferenceLine y={90} label="Óptimo (90%)" stroke="#4CAF50" strokeDasharray="3 3" />
            <ReferenceLine y={70} label="Mínimo (70%)" stroke="#FFC107" strokeDasharray="3 3" />
            
            <Bar 
              dataKey={dataKey}
              name={showMode === 'weighted' ? "% Cumplimiento Ponderado" : "% Cumplimiento Simple"}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {/* Colorear barras según el valor */}
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(showMode === 'weighted' ? entry.porcentajePonderado : entry.porcentajeSimple)} 
                />
              ))}
              <LabelList dataKey={dataKey} position="top" formatter={(value) => `${value}%`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className={styles.chartFooter}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.green}`}></div>
          <span>Óptimo (≥90%)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.yellow}`}></div>
          <span>Aceptable (70-89%)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.red}`}></div>
          <span>Crítico (≤70%)</span>
        </div>
      </div>
    </>
  );
}

export default WeightedRegionComplianceChart;