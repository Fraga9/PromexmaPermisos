// src/components/dashboard/UnitRanking.jsx
import React, { useState } from 'react';
import styles from './UnitRanking.module.css';

function UnitRanking({ data }) {
  console.log('UnitRanking Data:', data);
  const [showTopUnits, setShowTopUnits] = useState(true);
  
  if (!data || (!data.topUnits && !data.bottomUnits) || 
      ((!data.topUnits || data.topUnits.length === 0) && 
       (!data.bottomUnits || data.bottomUnits.length === 0))) {
    return <div>No hay datos disponibles para el ranking</div>;
  }

  // Function to render a list of units
  const renderUnitList = (units) => {
    if (!units || units.length === 0) return null;
    
    return (
      <ul className={styles.rankingList}>
        {units.map((unit, index) => {
          const score = unit.cumplimiento_pct !== undefined 
            ? unit.cumplimiento_pct 
            : (unit.total_permisos > 0 
                ? Math.round((unit.vigentes / unit.total_permisos) * 100) 
                : 0);
          
          return (
            <li key={unit.id} className={styles.rankingItem}>
              <div className={styles.rankNumber}>{index + 1}</div>
              <div className={styles.rankContent}>
                <div className={styles.unitName}>{unit.nombre}</div>
                <div className={styles.unitInfo}>
                  <span className={styles.region}>{unit.region}</span>
                  <span className={styles.compliantCount}>{unit.vigentes} de {unit.total_permisos} permisos vigentes</span>
                </div>
              </div>
              <div className={`${styles.score} ${getScoreClass(score)}`}>
                {score.toFixed(1)}%
              </div>
            </li>
          );  
        })}
      </ul>
    );
  };

  return (
    <div className={styles.rankingContainer}>
      <div className={styles.toggleContainer}>
        <div className={`${styles.toggleSwitch} ${!showTopUnits ? styles.rightActive : ''}`}>
          <button 
            className={`${styles.toggleButton} ${showTopUnits ? styles.active : ''}`}
            onClick={() => setShowTopUnits(true)}
            aria-pressed={showTopUnits}
          >
            Mejores Unidades
          </button>
          <button 
            className={`${styles.toggleButton} ${!showTopUnits ? styles.active : ''}`}
            onClick={() => setShowTopUnits(false)}
            aria-pressed={!showTopUnits}
          >
            Menor Desempeño
          </button>
        </div>
      </div>
      
      <div className={styles.rankingSection} key={showTopUnits ? 'top' : 'bottom'}>
        {showTopUnits 
          ? (data.topUnits && data.topUnits.length > 0 && renderUnitList(data.topUnits))
          : (data.bottomUnits && data.bottomUnits.length > 0 && renderUnitList(data.bottomUnits))
        }
      </div>
    </div>
  );
}

function getScoreClass(score) {
  if (score >= 80) return styles.high;
  if (score >= 60) return styles.medium;
  return styles.low;
}

export default UnitRanking;