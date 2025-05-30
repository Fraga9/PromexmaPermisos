import React, { useState } from 'react';
import { MdSave, MdEdit, MdCheckCircle, MdCancel, MdDelete, MdAttachFile } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import styles from './PermitRow.module.css';
import { useAuth } from '../../context/AuthContext';
import UnitUploadFile from './UnitUploadFile';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Obtiene solo la parte de la fecha (YYYY-MM-DD)
  } catch (e) {
    return 'Fecha inválida';
  }
};

// Helper to determine visual status based on expiration date
const getStatusVisual = (vigencia) => {
  if (!vigencia) return 'Indefinido';

  const expirationDate = new Date(vigencia);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expirationDate < today) return 'Vencido';
  if (expirationDate <= thirtyDaysFromNow) return 'Por vencer';
  return 'Vigente';
};

function PermitRow({ permit, onUpdatePermit, onDeletePermit }) {
  const [newDate, setNewDate] = useState(permit.vigencia || '');
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [newComment, setNewComment] = useState(permit.comentarios || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const { isAuthenticated } = useAuth();

  // Status to visual class mapping
  const statusClassMap = {
    'Vigente': styles.statusVigente,
    'Por vencer': styles.statusPorVencer,
    'Vencido': styles.statusVencido,
    'Indefinido': styles.statusUnknown
  };

  const statusVisual = getStatusVisual(permit.vigencia);
  const statusClass = statusClassMap[statusVisual] || styles.statusUnknown;

  const handleDateChange = (e) => {
    setNewDate(e.target.value);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSaveDate = async () => {
    setIsUpdating(true);
    await onUpdatePermit(permit.id, { vigencia: newDate });
    setIsUpdating(false);
  };

  const handleSaveComment = async () => {
    setIsUpdating(true);
    await onUpdatePermit(permit.id, { comentarios: newComment });
    setIsEditingComment(false);
    setIsUpdating(false);
  };

  const handleCancelEditComment = () => {
    setNewComment(permit.comentarios || '');
    setIsEditingComment(false);
  };

  const handleDeletePermit = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      onDeletePermit(permit.id);
    }
  };

  const toggleDocuments = () => {
    setShowDocuments(!showDocuments);
  };

  return (
    <>
      <tr className={styles.tableRow}>
        <td data-label="Permiso" data-tooltip-id={`permit-name-${permit.id}`} data-tooltip-content={permit.permiso}>
          {permit.permiso}
          <Tooltip id={`permit-name-${permit.id}`} place="top" />
        </td>
        {isAuthenticated && (
          <td data-label="Nueva Vigencia">
            <div className={styles.dateInputContainer}>
              <input
                type="date"
                value={newDate}
                onChange={handleDateChange}
                className={styles.dateInput}
                disabled={isUpdating}
                data-tooltip-id={`date-picker-${permit.id}`}
                data-tooltip-content="Selecciona nueva fecha de vigencia"
              />
              <Tooltip id={`date-picker-${permit.id}`} place="top" />
              <button
                onClick={handleSaveDate}
                disabled={isUpdating || newDate === permit.vigencia}
                className={styles.iconButton}
                data-tooltip-id={`save-date-${permit.id}`}
                data-tooltip-content="Guardar nueva fecha"
              >
                <MdSave />
              </button>
              <Tooltip id={`save-date-${permit.id}`} place="top" />
            </div>
          </td>
        )}
        <td data-label="Vigencia Actual">{formatDate(permit.vigencia)}</td>
        <td data-label="Estatus">
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {statusVisual}
          </span>
        </td>
        <td data-label="Ponderación">{permit.ponderacion ?? '-'}</td>
        <td data-label="Puntaje">{permit.puntaje ?? '-'}</td>
        <td data-label="Comentarios">
          {isEditingComment ? (
            <div className={styles.commentEditContainer}>
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                className={styles.commentTextarea}
                disabled={isUpdating}
                rows={2}
                placeholder="Escribe un comentario..."
              />
              <div className={styles.commentActions}>
                <button
                  onClick={handleSaveComment}
                  disabled={isUpdating}
                  className={`${styles.iconButton} ${styles.saveIcon}`}
                  data-tooltip-id={`save-comment-${permit.id}`}
                  data-tooltip-content="Guardar comentario"
                >
                  <MdCheckCircle />
                </button>
                <button
                  onClick={handleCancelEditComment}
                  disabled={isUpdating}
                  className={`${styles.iconButton} ${styles.cancelIcon}`}
                  data-tooltip-id={`cancel-comment-${permit.id}`}
                  data-tooltip-content="Cancelar"
                >
                  <MdCancel />
                </button>
              </div>
              <Tooltip id={`save-comment-${permit.id}`} place="top" />
              <Tooltip id={`cancel-comment-${permit.id}`} place="top" />
            </div>
          ) : (
            <div className={styles.commentDisplay}>
              <span className={styles.commentText}>{permit.comentarios || '-'}</span>
              <button
                onClick={() => setIsEditingComment(true)}
                className={styles.editCommentButton}
                data-tooltip-id={`edit-comment-${permit.id}`}
                data-tooltip-content="Editar comentario"
              >
                <MdEdit />
              </button>
              <Tooltip id={`edit-comment-${permit.id}`} place="top" />
            </div>
          )}
        </td>
        <td data-label="Acciones">
          <div className={styles.actionButtons}>
            <button
              onClick={toggleDocuments}
              className={`${styles.iconButton} ${styles.documentIcon}`}
              data-tooltip-id={`toggle-documents-${permit.id}`}
              data-tooltip-content={showDocuments ? "Ocultar documentos" : "Ver documentos"}
            >
              <MdAttachFile />
            </button>
            <Tooltip id={`toggle-documents-${permit.id}`} place="top" />
            
            {isAuthenticated && (
              <>
                <button
                  onClick={handleDeletePermit}
                  className={`${styles.iconButton} ${styles.deleteIcon}`}
                  data-tooltip-id={`delete-permit-${permit.id}`}
                  data-tooltip-content="Eliminar permiso"
                >
                  <MdDelete />
                </button>
                <Tooltip id={`delete-permit-${permit.id}`} place="top" />
              </>
            )}
          </div>
        </td>
      </tr>
      {showDocuments && (
        <tr className={styles.documentsRow}>
          <td colSpan={isAuthenticated ? "8" : "7"}>
            <UnitUploadFile permitId={permit.id} />
          </td>
        </tr>
      )}
    </>
  );
}

export default PermitRow;