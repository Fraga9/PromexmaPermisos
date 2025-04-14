// src/components/dashboard/KPICards.jsx
import React from 'react';
import KPICard from './KPICard';
import styles from './KPICards.module.css';

function KPICards({ data }) {
  if (!data) return <div>No hay datos disponibles</div>;
  

  // Calculamos el porcentaje de unidades en cumplimiento
  const percentCompliant = Math.round((data.compliantUnits / data.totalUnits) * 100) || 0;

  return (
    <div className={styles.kpiContainer}>
      <KPICard
        title="% Unidades en Cumplimiento"
        value={`${percentCompliant}%`}
        status={percentCompliant > 80 ? 'success' : percentCompliant > 60 ? 'warning' : 'danger'}
        icon="valid"
      />
      <KPICard
        title="Unidades no en Reglamento"
        value={data.nonCompliantUnits}
        status={data.nonCompliantUnits === 0 ? 'success' : data.nonCompliantUnits < 5 ? 'warning' : 'danger'}
        icon="expired"
      />
      <KPICard
        title="Unidades en Advertencia"
        value={data.warningUnits}
        status={data.warningUnits === 0 ? 'success' : data.warningUnits < 10 ? 'warning' : 'danger'}
        icon="expiring"
      />
      <KPICard
        title="Total de Unidades"
        value={data.totalUnits}
        status={'info'}
        icon="score"
      />
      <KPICard
        title="Unidades Conformes"
        value={data.compliantUnits}
        status={data.compliantUnits > (data.totalUnits * 0.8) ? 'success' : data.compliantUnits > (data.totalUnits * 0.6) ? 'warning' : 'danger'}
        icon="critical"
      />
    </div>
  );
}

export default KPICards;