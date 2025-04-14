import React, { useState } from 'react';
import styles from './AddPermitForm.module.css';

function AddPermitForm({ availablePermits, unit, onAddPermit }) {
  const [newPermit, setNewPermit] = useState({
    permiso: '',
    vigencia: '',
    estatus_req: 'Vigente',
    unidad_operativa: unit.nombre,
    region: unit.region || '',
    comentarios: ''
  });

  const handleChange = (field, value) => {
    setNewPermit(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newPermit.permiso) {
      alert('Por favor selecciona un tipo de permiso');
      return;
    }
    
    onAddPermit(newPermit);
  };

  return (
    <div className={styles.addPermitForm}>
      <div className={styles.formGroup}>
        <label htmlFor="permiso-select">Tipo de Permiso</label>
        <select
          id="permiso-select"
          value={newPermit.permiso}
          onChange={(e) => handleChange('permiso', e.target.value)}
          className={styles.formSelect}
        >
          <option value="">Selecciona un permiso</option>
          {availablePermits.map(permit => (
            <option key={permit} value={permit}>{permit}</option>
          ))}
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="vigencia-date">Fecha de Vigencia</label>
        <input
          id="vigencia-date"
          type="date"
          value={newPermit.vigencia}
          onChange={(e) => handleChange('vigencia', e.target.value)}
          className={styles.formInput}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="comentarios-textarea">Comentarios</label>
        <textarea
          id="comentarios-textarea"
          value={newPermit.comentarios}
          onChange={(e) => handleChange('comentarios', e.target.value)}
          className={styles.formTextarea}
          placeholder="Comentarios adicionales sobre el permiso"
          rows={3}
        />
      </div>
      
      <div className={styles.formActions}>
        <button
          className={styles.addButton}
          onClick={handleSubmit}
        >
          Guardar Permiso
        </button>
      </div>
    </div>
  );
}

export default AddPermitForm;