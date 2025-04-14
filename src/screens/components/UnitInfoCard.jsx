import React, { useState } from 'react';
import { MdEdit, MdCheckCircle, MdCancel } from 'react-icons/md';
import styles from './UnitInfoCard.module.css';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  } catch (e) {
    return 'Fecha inválida';
  }
};

function UnitInfoCard({ unit, onUpdateField }) {
  const [editingField, setEditingField] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState('');

  const handleStartEditing = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditFieldValue(currentValue || '');
  };

  const handleSave = () => {
    if (!editingField) return;
    onUpdateField({ [editingField]: editFieldValue });
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  // Reusable editable field component
  const EditableField = ({ label, fieldName, value, type = 'text' }) => (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      {editingField === fieldName ? (
        <div className={styles.fieldEditContainer}>
          <input
            type={type}
            value={editFieldValue}
            onChange={(e) => setEditFieldValue(e.target.value)}
            className={styles.fieldInput}
            autoFocus
          />
          <div className={styles.fieldEditActions}>
            <button onClick={handleSave} className={`${styles.iconButton} ${styles.saveIcon}`}>
              <MdCheckCircle />
            </button>
            <button onClick={handleCancel} className={`${styles.iconButton} ${styles.cancelIcon}`}>
              <MdCancel />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.fieldDisplay}>
          <span className={styles.infoValue}>{value || '-'}</span>
          <button
            onClick={() => handleStartEditing(fieldName, value)}
            className={styles.editFieldButton}
          >
            <MdEdit />
          </button>
        </div>
      )}
    </div>
  );

  // Read-only field component
  const ReadOnlyField = ({ label, value }) => (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || '-'}</span>
    </div>
  );

  return (
    <div className={styles.card}>
      <h2 className={styles.cardHeader}>Información General</h2>
      <div className={styles.infoGrid}>
        <ReadOnlyField label="ID" value={unit.id} />
        <EditableField label="Región" fieldName="region" value={unit.region} />
        <EditableField label="Correo" fieldName="correo_electronico" value={unit.correo_electronico} type="email" />
        <EditableField label="Teléfono" fieldName="telefono" value={unit.telefono} type="tel" />
        <EditableField label="Dirección" fieldName="direccion" value={unit.direccion} />
        <EditableField label="C.P." fieldName="codigo_postal" value={unit.codigo_postal} />
        <ReadOnlyField label="Fecha Creación" value={formatDate(unit.fecha_creacion)} />
      </div>
    </div>
  );
}

export default UnitInfoCard;