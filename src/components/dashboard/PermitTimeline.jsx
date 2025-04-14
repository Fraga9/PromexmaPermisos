import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './PermitTimeline.module.css';

function PermitTimeline({ data }) {
  if (!data || data.length === 0) {
    return <div className={styles.emptyMessage}>No hay permisos críticos próximos a vencer</div>;
  }

  const sortedPermits = [...data]
    .sort((a, b) => new Date(a.vigencia) - new Date(b.vigencia))
    .slice(0, 10);

  const today = new Date();

  return (
    <div className={styles.timelineContainer}>
      {sortedPermits.map((permit) => {
        const expirationDate = new Date(permit.vigencia);
        if (isNaN(expirationDate)) {
          console.error('Fecha inválida:', permit.vigencia);
          return null;
        }

        const daysRemaining = differenceInDays(expirationDate, today);
        const expired = daysRemaining < 0;

        return (
          <div key={permit.id} className={`${styles.card} ${getMarkerClass(daysRemaining)}`}>
            <div className={styles.cardHeader}>
              <span className={styles.daysBadge}>{expired ? 'Vencido' : `${daysRemaining} días`}</span>
              <span className={styles.date}>
                {expired ? 'Venció el' : 'Vence el'}{' '}
                {format(expirationDate, 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.permitTitle}>{permit.permiso}</h3>
              <p className={styles.unitName}>{permit.unidad}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getMarkerClass(daysRemaining) {
  if (daysRemaining < 0) return styles.expired;
  if (daysRemaining <= 7) return styles.critical;
  if (daysRemaining <= 15) return styles.warning;
  return styles.normal;
}

export default PermitTimeline;
