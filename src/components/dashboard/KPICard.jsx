// src/components/dashboard/KPICard.jsx
import React from 'react';
import styles from './KPICard.module.css';
import { CheckCircle, AlertCircle, XCircle, Award, Calendar } from 'lucide-react';

function KPICard({ title, value, status = 'info', icon }) {
  const cardClass = `${styles.card} ${styles[status] || styles.info}`;

  const renderIcon = () => {
    switch (icon) {
      case 'valid':
        return <CheckCircle className={styles.icon} />;
      case 'expired':
        return <XCircle className={styles.icon} />;
      case 'expiring':
        return <Calendar className={styles.icon} />;
      case 'score':
        return <Award className={styles.icon} />;
      case 'critical':
        return <AlertCircle className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={cardClass}>
      <div className={styles.iconContainer}>{renderIcon()}</div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value}>{value ?? '-'}</div>
      </div>
    </div>
  );
}

export default KPICard;