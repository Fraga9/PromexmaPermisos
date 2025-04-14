// src/components/dashboard/ComplianceHeatMap.jsx
import React from 'react';
import styles from './ComplianceHeatMap.module.css';

function ComplianceHeatMap({ data }) {
  if (!data || !data.units || !data.permits) {
    return <div>No hay datos disponibles para la matriz de cumplimiento</div>;
  }

  // Función para determinar el color según el estatus
  const getStatusColor = (status) => {
    switch (status) {
      case 'Cumplido':
        return styles.compliant;
      case 'Vencido':
        return styles.expired;
      case 'Por vencer':
        return styles.expiring;
      default:
        return styles.notApplicable;
    }
  };

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.scrollableContainer}>
        <table className={styles.heatmap}>
          <thead>
            <tr>
              <th>Unidad Operativa</th>
              {data.permits.map(permit => (
                <th key={permit.id} className={styles.rotated}>
                  <div>{permit.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.units.map(unit => (
              <tr key={unit.id}>
                <td className={styles.unitName}>{unit.name}</td>
                {data.permits.map(permit => {
                  const cell = data.matrix.find(
                    item => item.unitId === unit.id && item.permitId === permit.id
                  );
                  return (
                    <td 
                      key={`${unit.id}-${permit.id}`} 
                      className={`${styles.cell} ${cell ? getStatusColor(cell.status) : styles.notApplicable}`}
                      title={cell ? `${unit.name} - ${permit.name}: ${cell.status}` : 'No aplicable'}
                    >
                      {cell ? cell.statusShort : 'N/A'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.compliant}`}></span>
          <span>Cumplido</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.expiring}`}></span>
          <span>Por vencer</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.expired}`}></span>
          <span>Vencido</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.notApplicable}`}></span>
          <span>No aplica</span>
        </div>
      </div>
    </div>
  );
}

export default ComplianceHeatMap;