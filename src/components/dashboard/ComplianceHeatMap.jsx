import React from 'react';
import styles from './ComplianceHeatMap.module.css';

function ComplianceHeatMap({ data }) {
  
  if (!data || data.length === 0) {
    return (
      <div className={styles.noData}>No hay datos disponibles para la matriz de cumplimiento</div>
    );
  }

  // Ordenar datos por porcentaje de cumplimiento (de mayor a menor)
  const sortedData = [...data].sort((a, b) => {
    const totalA = a.green + a.yellow + a.red;
    const totalB = b.green + b.yellow + b.red;
    
    const complianceA = totalA === 0 ? 0 : (a.green / totalA) * 100;
    const complianceB = totalB === 0 ? 0 : (b.green / totalB) * 100;
    
    return complianceB - complianceA; // Orden descendente
  });

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.scrollableContainer}>
        <table className={styles.heatmap}>
          <thead>
            <tr>
              <th>Tipo de Permiso</th>
              <th>Cumplidos</th>
              <th>Por Vencer</th>
              <th>Vencidos</th>
              <th>Total</th>
              <th>Estado General</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => {
              const total = item.green + item.yellow + item.red;
              const compliance = Math.round((item.green / total) * 100) || 0;
              let statusClass = '';
              
              if (compliance >= 80) statusClass = styles.compliant;
              else if (compliance >= 50) statusClass = styles.expiring;
              else statusClass = styles.expired;
              
              return (
                <tr key={index}>
                  <td className={styles.permitName}>{item.permiso}</td>
                  <td className={styles.greenCell}>{item.green}</td>
                  <td className={styles.yellowCell}>{item.yellow}</td>
                  <td className={styles.redCell}>{item.red}</td>
                  <td>{total}</td>
                  <td className={statusClass}>{compliance}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.compliant}`}></span>
          <span>Cumplido (≥80%)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.expiring}`}></span>
          <span>Precaución (50-79%)</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.expired}`}></span>
          <span>Crítico (≤50%)</span>
        </div>
      </div>
    </div>
  );
}

export default ComplianceHeatMap;