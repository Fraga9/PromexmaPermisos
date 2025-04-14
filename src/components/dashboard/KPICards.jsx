// src/components/dashboard/KPICards.jsx
import React from 'react';
import KPICard from './KPICard';
import styles from './KPICards.module.css';

function KPICards({ data }) {
  if (!data) return <div>No hay datos disponibles</div>;

  return (
    <div className={styles.kpiContainer}>
      <KPICard
        title="% Permisos Vigentes"
        value={`${data.percentValidPermits}%`}
        status={data.percentValidPermits > 80 ? 'success' : data.percentValidPermits > 60 ? 'warning' : 'danger'}
        icon="valid"
      />
      <KPICard
        title="Permisos Vencidos"
        value={data.expiredPermits}
        status={data.expiredPermits === 0 ? 'success' : data.expiredPermits < 5 ? 'warning' : 'danger'}
        icon="expired"
      />
      <KPICard
        title="Permisos por Vencer (30 días)"
        value={data.expiringPermits}
        status={data.expiringPermits === 0 ? 'success' : data.expiringPermits < 10 ? 'warning' : 'danger'}
        icon="expiring"
      />
      <KPICard
        title="Puntaje Promedio"
        value={`${data.averageScore}/100`}
        status={data.averageScore > 80 ? 'success' : data.averageScore > 60 ? 'warning' : 'danger'}
        icon="score"
      />
      <KPICard
        title="Unidades en Estado Crítico"
        value={data.criticalUnits}
        status={data.criticalUnits === 0 ? 'success' : data.criticalUnits < 3 ? 'warning' : 'danger'}
        icon="critical"
      />
    </div>
  );
}

export default KPICards;