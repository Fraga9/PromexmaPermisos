// src/components/dashboard/UnitRanking.jsx
import React from 'react';
import styles from './UnitRanking.module.css';

function UnitRanking({ data }) {
  if (!data || data.length === 0) {
    return <div>No hay datos disponibles para el ranking</div>;
  }

  // Ordenar unidades de mayor a menor puntaje
  const sortedUnits = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className={styles.rankingContainer}>
      <ul className={styles.rankingList}>
        {sortedUnits.map((unit, index) => (
          <li key={unit.id} className={styles.rankingItem}>
            <div className={styles.rankNumber}>{index + 1}</div>
            <div className={styles.rankContent}>
              <div className={styles.unitName}>{unit.name}</div>
              <div className={styles.unitInfo}>
                <span className={styles.region}>{unit.region}</span>
                <span className={styles.compliantCount}>{unit.compliantPermits} permisos cumplidos</span>
              </div>
            </div>
            <div className={`${styles.score} ${getScoreClass(unit.score)}`}>
              {unit.score}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Función para determinar la clase CSS basada en el puntaje
function getScoreClass(score) {
  if (score >= 80) return styles.high;
  if (score >= 60) return styles.medium;
  return styles.low;
}

export default UnitRanking;