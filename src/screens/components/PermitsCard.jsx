import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './PermitsCard.module.css';
import PermitRow from './PermitRow';
import AddPermitForm from './AddPermitForm';
import { useAuth } from '../../context/AuthContext'; // Importamos el contexto de autenticación

function PermitsCard({ permits, unit, onAddPermit, onUpdatePermit, onDeletePermit }) {
  const [isAddingPermit, setIsAddingPermit] = useState(false);
  const { isAuthenticated } = useAuth(); // Usamos el hook de autenticación

  // List of available permit types
  const availablePermits = [
    'Plan Interno De Protección Civil Y/O Su Anuencia (Pipc)',
    'Licencia Municipal (Lm)',
    'Autorización De Impacto Ambiental (Ia)',
    'Licencia Ambiental Municipal (Lam)',
    'Licencia De Imagen Urbana (Anuncios) (Lia)',
    'Pago Del Impuesto Predial (Predial)',
    'Licencia O Factibilidad De Uso De Suelo (Lus)',
    'Titulo De Propiedad, Escritura O Contrato De Arrendamiento (CA)'
  ];

  // Export permits data to CSV
  const exportCSV = () => {
    // Create headers
    const headers = [
      'ID',
      'Permiso',
      'Vigencia',
      'Estatus',
      'Unidad Operativa',
      'Región',
      'Ponderación',
      'Puntaje',
      'Comentarios'
    ];

    // Create data rows
    const rows = permits.map((p) => [
      p.id,
      p.permiso,
      p.vigencia ? new Date(p.vigencia).toLocaleDateString() : '',
      p.estatus_req,
      p.unidad_operativa,
      p.region,
      p.ponderacion,
      p.puntaje || 0,
      p.comentarios || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `permisos_sucursal_${unit.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPermit = async (newPermit) => {
    const success = await onAddPermit(newPermit);
    if (success) {
      setIsAddingPermit(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.permitHeaderSection}>
        <h2 className={styles.cardHeader}>Permisos Asociados</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.exportButton} 
            onClick={exportCSV}
          >
            Exportar CSV
          </button>
          {isAuthenticated && (
            <button
              className={styles.addPermitButton}
              onClick={() => setIsAddingPermit(!isAddingPermit)}
            >
              {isAddingPermit ? 'Cancelar' : 'Añadir Permiso'}
            </button>
          )}
        </div>
      </div>

      {/* Form for adding new permit */}
      {isAuthenticated && isAddingPermit && (
        <AddPermitForm 
          availablePermits={availablePermits}
          unit={unit}
          onAddPermit={handleAddPermit}
        />
      )}

      <div className={styles.tableContainer}>
        <table className={styles.permitsTable}>
          <thead>
            <tr>
              <th>Permiso</th>
              {isAuthenticated ? <th>Nueva Vigencia</th> : null}
              <th>Vigencia Actual</th>
              <th>Estatus</th>
              <th>Ponderación</th>
              <th>Puntaje</th>
              <th>Comentarios</th>
              {isAuthenticated ? <th>Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {permits.length > 0 ? (
              permits.map((permit) => (
                <PermitRow 
                  key={permit.id} 
                  permit={permit}
                  onUpdatePermit={onUpdatePermit}
                  onDeletePermit={onDeletePermit}
                />
              ))
            ) : (
              <tr>
                <td colSpan={isAuthenticated ? "8" : "6"} className={styles.noResults}>
                  Esta unidad no tiene permisos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PermitsCard;