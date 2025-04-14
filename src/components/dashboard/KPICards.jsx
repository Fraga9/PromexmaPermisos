// src/components/dashboard/KPICards.jsx
import React from 'react';
import KPICard from './KPICard';
import styles from './KPICards.module.css';

function KPICards({ data }) {
  if (!data) return <div>No hay datos disponibles</div>;
  
  // Define thresholds for color statuses
  const getStatusForPercentage = (percentage) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'danger';
  };

  return (
    <div className={styles.kpiContainer}>
      <KPICard
        title="Índice de Cumplimiento General"
        value={`${data.avgComplianceScore}%`}
        status={getStatusForPercentage(data.avgComplianceScore)}
        icon="score"
        tooltip="Porcentaje promedio de permisos vigentes por unidad operativa"
      />
      
      <KPICard
        title="Cumplimiento Ponderado"
        value={`${data.weightedComplianceScore}%`}
        status={getStatusForPercentage(data.weightedComplianceScore)}
        icon="valid"
        tooltip="Índice que considera la importancia de cada permiso según su ponderación"
      />
      
      <KPICard
        title="Permisos Críticos"
        value={`${data.criticalPermitCompliance}%`}
        status={getStatusForPercentage(data.criticalPermitCompliance)}
        icon="critical"
        tooltip="Cumplimiento de permisos con ponderación 3 (los más importantes)"
      />
      
      <KPICard
        title="Unidades en Regla"
        value={data.compliantUnits}
        secondaryValue={`${Math.round((data.compliantUnits / data.totalUnits) * 100)}%`}
        status={getStatusForPercentage((data.compliantUnits / data.totalUnits) * 100)}
        icon="valid"
        tooltip="Unidades con todos sus permisos vigentes"
      />
      
      <KPICard
        title="Permisos Vencidos"
        value={data.totalExpiredPermits}
        status={data.totalExpiredPermits === 0 ? 'success' : data.totalExpiredPermits > 10 ? 'danger' : 'warning'}
        icon="expired"
        tooltip="Total de permisos en estado vencido que requieren atención inmediata"
      />
      
      <KPICard
        title="Permisos Por Vencer"
        value={data.totalExpiringPermits}
        status={data.totalExpiringPermits === 0 ? 'success' : data.totalExpiringPermits > 20 ? 'warning' : 'info'}
        icon="expiring"
        tooltip="Permisos próximos a vencer que requieren acción preventiva"
      />
    </div>
  );
}

export default KPICards;