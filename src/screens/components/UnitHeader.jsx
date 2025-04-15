import React, { useState } from 'react';
import { MdEdit, MdCheckCircle, MdCancel } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import styles from './UnitHeader.module.css';
import { useAuth } from '../../context/AuthContext'; // Importamos el contexto de autenticación

function UnitHeader({ unit, compliancePercentage, onUpdateTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(unit.nombre);
  const { isAuthenticated } = useAuth(); // Usamos el hook de autenticación

  const handleSave = () => {
    if (!newTitle.trim()) return;
    onUpdateTitle(newTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewTitle(unit.nombre);
    setIsEditing(false);
  };

  return (
    <div className={styles.headerSection}>
      <div className={styles.unitHeader}>
        {isAuthenticated && isEditing ? (
          <div className={styles.titleEditContainer}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={styles.titleInput}
              placeholder="Nombre de la unidad"
              autoFocus
            />
            <div className={styles.titleEditActions}>
              <button
                onClick={handleSave}
                className={`${styles.iconButton} ${styles.saveIcon}`}
                data-tooltip-id="save-title"
                data-tooltip-content="Guardar título"
              >
                <MdCheckCircle />
              </button>
              <button
                onClick={handleCancel}
                className={`${styles.iconButton} ${styles.cancelIcon}`}
                data-tooltip-id="cancel-title"
                data-tooltip-content="Cancelar"
              >
                <MdCancel />
              </button>
            </div>
            <Tooltip id="save-title" place="top" />
            <Tooltip id="cancel-title" place="top" />
          </div>
        ) : (
          <div className={styles.titleDisplay}>
            <h1>{unit.nombre}</h1>
            {isAuthenticated && (
              <button
                onClick={() => setIsEditing(true)}
                className={styles.editTitleButton}
                data-tooltip-id="edit-title"
                data-tooltip-content="Editar título"
              >
                <MdEdit />
              </button>
            )}
            {isAuthenticated && <Tooltip id="edit-title" place="top" />}
          </div>
        )}
        <span className={unit.activo ? styles.statusActive : styles.statusInactive}>
          {unit.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className={styles.complianceIndicator}>
        <div className={styles.complianceLabel}>Cumplimiento</div>
        <div className={styles.complianceWrapper}>
          <div
            className={styles.complianceMeter}
            style={{
              width: `${compliancePercentage}%`,
              backgroundColor: compliancePercentage >= 80 
                ? '#28a745' 
                : (compliancePercentage >= 50 ? '#ffc107' : '#dc3545')
            }}
          />
          <span className={styles.complianceValue}>
            {compliancePercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default UnitHeader;