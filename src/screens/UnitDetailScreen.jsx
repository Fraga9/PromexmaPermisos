import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './UnitDetailScreen.module.css';
import { MdArrowBack, MdSave, MdEdit, MdCancel, MdCheckCircle, MdAdd, MdDelete } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';

// Helper para formatear fechas
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        // Ajustar por zona horaria si es necesario (Supabase suele guardar en UTC)
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-MX'); // Formato dd/mm/yyyy
    } catch (e) {
        return 'Fecha inválida';
    }
};

// Helper para calcular porcentaje
const calculateCompliance = (permits) => {
    if (!permits || permits.length === 0) return 100; // O 0 si no tener permisos es incumplir

    const totalPonderacion = permits.reduce((sum, p) => sum + (p.ponderacion || 0), 0);
    if (totalPonderacion === 0) return 100; // Evitar división por cero

    // Sumar puntaje solo si está vigente
    const currentPuntaje = permits.reduce((sum, p) => {
        const isCompliant = p.estatus_req === 'Vigente';
        return sum + (isCompliant ? (p.ponderacion || 0) : 0);
    }, 0);

    return Math.round((currentPuntaje / totalPonderacion) * 100);
};

function UnitDetailScreen() {
    const { id } = useParams(); // Obtener el ID de la URL
    const [unit, setUnit] = useState(null);
    const [permits, setPermits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [compliancePercentage, setCompliancePercentage] = useState(0);
    const [updatingPermitId, setUpdatingPermitId] = useState(null); // Para mostrar feedback de carga
    const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    // Estados para edición de título
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    // Estados para edición de información general
    const [editingField, setEditingField] = useState(null);
    const [editFieldValue, setEditFieldValue] = useState('');

    // Estados para añadir nuevo permiso
    const [isAddingPermit, setIsAddingPermit] = useState(false);
    const [newPermit, setNewPermit] = useState({
        permiso: '',
        vigencia: '',
        unidad_operativa: '',
        region: '',
        estatus_req: 'Vigente'
    });

    // Lista de permisos disponibles para añadir
    const availablePermits = [
        'Plan Interno De Protección Civil Y/O Su Anuencia (Pipc)',
        'Licencia Municipal (Lm)',
        'Autorización De Impacto Ambiental (Ia)',
        'Licencia Ambiental Municipal (Lam)',
        'Licencia De Imagen Urbana (Anuncios) (Lia)',
        'Pago Del Impuesto Predial (Predial)',
        'Licencia O Factibilidad De Uso De Suelo (Lus)',
        'Titulo De Propiedad, Escritura O Contrato De Arrendamiento (Ca)'
    ];

    // Función para cargar los datos
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Cargar datos de la unidad
            const { data: unitData, error: unitError } = await supabase
                .from('unidades_operativas')
                .select('*')
                .eq('id', id)
                .single(); // Esperamos solo un resultado

            if (unitError) throw unitError;
            setUnit(unitData);
            setNewTitle(unitData.nombre);

            // Cargar permisos asociados
            const { data: permitsData, error: permitsError } = await supabase
                .from('permisos')
                .select('*')
                .eq('unidad_operativa_id', id)
                .order('permiso', { ascending: true }); // Ordenar permisos

            if (permitsError) throw permitsError;
            setPermits(permitsData || []);

            // Calcular porcentaje de cumplimiento
            setCompliancePercentage(calculateCompliance(permitsData || []));

        } catch (err) {
            console.error("Error fetching unit details:", err);
            setError("No se pudieron cargar los detalles de la unidad o sus permisos.");
            setUnit(null);
            setPermits([]);
        } finally {
            setLoading(false);
        }
    }, [id]); // Depende del ID de la unidad

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Llamar a fetchData cuando el componente se monta o el ID cambia

    // Función para mostrar notificaciones toast
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
    };

    // Función para manejar la actualización de vigencia
    const handleUpdateVigencia = async (permitId, newVigencia) => {
        if (!newVigencia) {
            showToast('Por favor, selecciona una fecha de vigencia.', 'error');
            return;
        }
        setUpdatingPermitId(permitId); // Indicar que este permiso se está actualizando
        try {
            const { error: updateError } = await supabase
                .from('permisos')
                .update({ vigencia: newVigencia })
                .eq('id', permitId);

            if (updateError) throw updateError;

            // Si la actualización fue exitosa, volver a cargar los datos
            showToast('Vigencia actualizada correctamente.');
            fetchData();

        } catch (err) {
            console.error("Error updating permit vigencia:", err);
            showToast(`Error al actualizar la vigencia: ${err.message}`, 'error');
        } finally {
            setUpdatingPermitId(null); // Quitar indicador de carga
        }
    };

    // Función para manejar la actualización de comentarios
    const handleUpdateComment = async (permitId, newComment) => {
        setUpdatingPermitId(permitId); // Indicar que este permiso se está actualizando
        try {
            const { error: updateError } = await supabase
                .from('permisos')
                .update({ comentarios: newComment })
                .eq('id', permitId);

            if (updateError) throw updateError;

            // Si la actualización fue exitosa, volver a cargar los datos
            showToast('Comentario actualizado correctamente.');
            fetchData();

        } catch (err) {
            console.error("Error updating permit comment:", err);
            showToast(`Error al actualizar el comentario: ${err.message}`, 'error');
        } finally {
            setUpdatingPermitId(null); // Quitar indicador de carga
        }
    };

    // Función para actualizar el título de la unidad
    const handleUpdateTitle = async () => {
        if (!newTitle.trim()) {
            showToast('El título no puede estar vacío', 'error');
            return;
        }

        try {
            const { error } = await supabase
                .from('unidades_operativas')
                .update({ nombre: newTitle })
                .eq('id', id);

            if (error) throw error;

            showToast('Título actualizado correctamente');
            setIsEditingTitle(false);
            fetchData();
        } catch (err) {
            console.error("Error updating unit title:", err);
            showToast(`Error al actualizar título: ${err.message}`, 'error');
        }
    };

    // Función para comenzar a editar un campo
    const handleStartEditingField = (fieldName, currentValue) => {
        setEditingField(fieldName);
        setEditFieldValue(currentValue || '');
    };

    // Función para guardar un campo editado
    const handleSaveField = async () => {
        if (!editingField) return;

        try {
            const { error } = await supabase
                .from('unidades_operativas')
                .update({ [editingField]: editFieldValue })
                .eq('id', id);

            if (error) throw error;

            showToast('Campo actualizado correctamente');
            setEditingField(null);
            fetchData();
        } catch (err) {
            console.error("Error updating field:", err);
            showToast(`Error al actualizar el campo: ${err.message}`, 'error');
        }
    };

    // Función para cancelar la edición de un campo
    const handleCancelEditField = () => {
        setEditingField(null);
    };

    // Función para añadir un nuevo permiso
    const handleAddPermit = async () => {
        if (!newPermit.permiso) {
            showToast('Selecciona un tipo de permiso', 'error');
            return;
        }

        try {
            // Verificar si ya existe este permiso para esta unidad
            const existingPermit = permits.find(p => p.permiso === newPermit.permiso);
            if (existingPermit) {
                showToast('Este permiso ya existe para esta unidad', 'error');
                return;
            }

            const permitToAdd = {
                ...newPermit,
                unidad_operativa: unit.nombre,
                unidad_operativa_id: unit.id,
                region: unit.region || '',
                estatus_req: newPermit.vigencia ? 'Vigente' : 'Vencido'
            };

            const { error } = await supabase
                .from('permisos')
                .insert([permitToAdd]);

            if (error) throw error;

            showToast('Permiso añadido correctamente');
            setIsAddingPermit(false);
            setNewPermit({
                permiso: '',
                vigencia: '',
                unidad_operativa: '',
                region: '',
                estatus_req: 'Vigente'
            });
            fetchData();
        } catch (err) {
            console.error("Error adding permit:", err);
            showToast(`Error al añadir permiso: ${err.message}`, 'error');
        }
    };

    // Función para eliminar un permiso
    const handleDeletePermit = async (permitId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('permisos')
                .delete()
                .eq('id', permitId);

            if (error) throw error;

            showToast('Permiso eliminado correctamente');
            fetchData();
        } catch (err) {
            console.error("Error deleting permit:", err);
            showToast(`Error al eliminar permiso: ${err.message}`, 'error');
        }
    };

    // Componente interno para cada fila de permiso
    const PermitRow = ({ permit }) => {
        const [newDate, setNewDate] = useState(permit.vigencia || '');
        const [isEditingComment, setIsEditingComment] = useState(false);
        const [newComment, setNewComment] = useState(permit.comentarios || '');
        const isUpdating = updatingPermitId === permit.id;

        // Mapeo de estatus a clases CSS
        const statusClassMap = {
            'Vigente': styles.statusVigente,
            'Por Vencer': styles.statusPorVencer,
            'Vencido': styles.statusVencido,
        };
        const statusClass = statusClassMap[permit.estatus_req] || styles.statusUnknown;

        const handleDateChange = (e) => {
            setNewDate(e.target.value);
        };

        const handleCommentChange = (e) => {
            setNewComment(e.target.value);
        };

        const handleSaveDate = () => {
            handleUpdateVigencia(permit.id, newDate);
        };

        const handleSaveComment = () => {
            handleUpdateComment(permit.id, newComment);
            setIsEditingComment(false);
        };

        const handleCancelEditComment = () => {
            setNewComment(permit.comentarios || '');
            setIsEditingComment(false);
        };

        return (
            <tr key={permit.id} className={styles.tableRow}>
                <td data-tooltip-id="permit-name" data-tooltip-content={permit.permiso}>
                    {permit.permiso}
                    <Tooltip id="permit-name" place="top" />
                </td>
                <td>
                    <div className={styles.dateInputContainer}>
                        <input
                            type="date"
                            value={newDate}
                            onChange={handleDateChange}
                            className={styles.dateInput}
                            disabled={isUpdating}
                            data-tooltip-id="date-picker"
                            data-tooltip-content="Selecciona nueva fecha de vigencia"
                        />
                        <Tooltip id="date-picker" place="top" />
                        <button
                            onClick={handleSaveDate}
                            disabled={isUpdating || newDate === permit.vigencia}
                            className={styles.iconButton}
                            data-tooltip-id="save-date"
                            data-tooltip-content="Guardar nueva fecha"
                        >
                            {isUpdating ? <LoadingSpinner /> : <MdSave />}
                        </button>
                        <Tooltip id="save-date" place="top" />
                    </div>
                </td>
                <td>{formatDate(permit.vigencia)}</td>
                <td>
                    <span className={`${styles.statusBadge} ${statusClass}`}>
                        {permit.estatus_req}
                    </span>
                </td>
                <td>{permit.ponderacion ?? '-'}</td>
                <td>{permit.puntaje ?? '-'}</td>
                <td>
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
                                    data-tooltip-id="save-comment"
                                    data-tooltip-content="Guardar comentario"
                                >
                                    <MdCheckCircle />
                                </button>
                                <button
                                    onClick={handleCancelEditComment}
                                    disabled={isUpdating}
                                    className={`${styles.iconButton} ${styles.cancelIcon}`}
                                    data-tooltip-id="cancel-comment"
                                    data-tooltip-content="Cancelar"
                                >
                                    <MdCancel />
                                </button>
                                <Tooltip id="save-comment" place="top" style={{ zIndex: 1000 }} />
                                <Tooltip id="cancel-comment" place="top" style={{ zIndex: 1000 }} />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.commentDisplay}>
                            <span className={styles.commentText}>{permit.comentarios || '-'}</span>
                            <button
                                onClick={() => setIsEditingComment(true)}
                                className={styles.editCommentButton}
                                data-tooltip-id="edit-comment"
                                data-tooltip-content="Editar comentario"
                            >
                                <MdEdit />
                            </button>
                            <Tooltip id="edit-comment" place="top" style={{ zIndex: 1000 }} />
                        </div>
                    )}
                </td>
                <td>
                    <button
                        onClick={() => handleDeletePermit(permit.id)}
                        className={`${styles.iconButton} ${styles.deleteIcon}`}
                        data-tooltip-id="delete-permit"
                        data-tooltip-content="Eliminar permiso"
                    >
                        <MdDelete />
                    </button>
                    <Tooltip id="delete-permit" place="top" />
                </td>
            </tr>
        );
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <LoadingSpinner size="large" />
                <p>Cargando información de la unidad...</p>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!unit) {
        return <ErrorMessage message="No se encontró la unidad especificada." />;
    }

    return (
        <div className={styles.screenContainer}>
            {/* Toast notifications */}
            {toast.visible && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.message}
                </div>
            )}

            {/* Header with back button */}
            <div className={styles.headerWrapper}>
                <Link to="/unidades" className={styles.backLink}>
                    <MdArrowBack /> <span>Volver a la lista</span>
                </Link>

                <div className={styles.headerSection}>
                    <div className={styles.unitHeader}>
                        {isEditingTitle ? (
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
                                        onClick={handleUpdateTitle}
                                        className={`${styles.iconButton} ${styles.saveIcon}`}
                                        data-tooltip-id="save-title"
                                        data-tooltip-content="Guardar título"
                                    >
                                        <MdCheckCircle />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewTitle(unit.nombre);
                                            setIsEditingTitle(false);
                                        }}
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
                                <button
                                    onClick={() => setIsEditingTitle(true)}
                                    className={styles.editTitleButton}
                                    data-tooltip-id="edit-title"
                                    data-tooltip-content="Editar título"
                                >
                                    <MdEdit />
                                </button>
                                <Tooltip id="edit-title" place="top" />
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
                                    backgroundColor: compliancePercentage >= 80 ? '#28a745' :
                                        (compliancePercentage >= 50 ? '#ffc107' : '#dc3545')
                                }}
                            />
                            <span className={styles.complianceValue}>
                                {compliancePercentage}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unit Info Card */}
            <div className={styles.card}>
                <h2 className={styles.cardHeader}>Información General</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>ID</span>
                        <span className={styles.infoValue}>{unit.id}</span>
                    </div>

                    {/* Región (editable) */}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Región</span>
                        {editingField === 'region' ? (
                            <div className={styles.fieldEditContainer}>
                                <input
                                    type="text"
                                    value={editFieldValue}
                                    onChange={(e) => setEditFieldValue(e.target.value)}
                                    className={styles.fieldInput}
                                    autoFocus
                                />
                                <div className={styles.fieldEditActions}>
                                    <button onClick={handleSaveField} className={`${styles.iconButton} ${styles.saveIcon}`}>
                                        <MdCheckCircle />
                                    </button>
                                    <button onClick={handleCancelEditField} className={`${styles.iconButton} ${styles.cancelIcon}`}>
                                        <MdCancel />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.fieldDisplay}>
                                <span className={styles.infoValue}>{unit.region || '-'}</span>
                                <button
                                    onClick={() => handleStartEditingField('region', unit.region)}
                                    className={styles.editFieldButton}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Correo (editable) */}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Correo</span>
                        {editingField === 'correo_electronico' ? (
                            <div className={styles.fieldEditContainer}>
                                <input
                                    type="email"
                                    value={editFieldValue}
                                    onChange={(e) => setEditFieldValue(e.target.value)}
                                    className={styles.fieldInput}
                                    autoFocus
                                />
                                <div className={styles.fieldEditActions}>
                                    <button onClick={handleSaveField} className={`${styles.iconButton} ${styles.saveIcon}`}>
                                        <MdCheckCircle />
                                    </button>
                                    <button onClick={handleCancelEditField} className={`${styles.iconButton} ${styles.cancelIcon}`}>
                                        <MdCancel />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.fieldDisplay}>
                                <span className={styles.infoValue}>{unit.correo_electronico || '-'}</span>
                                <button
                                    onClick={() => handleStartEditingField('correo_electronico', unit.correo_electronico)}
                                    className={styles.editFieldButton}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Teléfono (editable) */}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Teléfono</span>
                        {editingField === 'telefono' ? (
                            <div className={styles.fieldEditContainer}>
                                <input
                                    type="tel"
                                    value={editFieldValue}
                                    onChange={(e) => setEditFieldValue(e.target.value)}
                                    className={styles.fieldInput}
                                    autoFocus
                                />
                                <div className={styles.fieldEditActions}>
                                    <button onClick={handleSaveField} className={`${styles.iconButton} ${styles.saveIcon}`}>
                                        <MdCheckCircle />
                                    </button>
                                    <button onClick={handleCancelEditField} className={`${styles.iconButton} ${styles.cancelIcon}`}>
                                        <MdCancel />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.fieldDisplay}>
                                <span className={styles.infoValue}>{unit.telefono || '-'}</span>
                                <button
                                    onClick={() => handleStartEditingField('telefono', unit.telefono)}
                                    className={styles.editFieldButton}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Dirección (editable) */}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Dirección</span>
                        {editingField === 'direccion' ? (
                            <div className={styles.fieldEditContainer}>
                                <input
                                    type="text"
                                    value={editFieldValue}
                                    onChange={(e) => setEditFieldValue(e.target.value)}
                                    className={styles.fieldInput}
                                    autoFocus
                                />
                                <div className={styles.fieldEditActions}>
                                    <button onClick={handleSaveField} className={`${styles.iconButton} ${styles.saveIcon}`}>
                                        <MdCheckCircle />
                                    </button>
                                    <button onClick={handleCancelEditField} className={`${styles.iconButton} ${styles.cancelIcon}`}>
                                        <MdCancel />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.fieldDisplay}>
                                <span className={styles.infoValue}>{unit.direccion || '-'}</span>
                                <button
                                    onClick={() => handleStartEditingField('direccion', unit.direccion)}
                                    className={styles.editFieldButton}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Código Postal (editable) */}
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>C.P.</span>
                        {editingField === 'codigo_postal' ? (
                            <div className={styles.fieldEditContainer}>
                                <input
                                    type="text"
                                    value={editFieldValue}
                                    onChange={(e) => setEditFieldValue(e.target.value)}
                                    className={styles.fieldInput}
                                    autoFocus
                                />
                                <div className={styles.fieldEditActions}>
                                    <button onClick={handleSaveField} className={`${styles.iconButton} ${styles.saveIcon}`}>
                                        <MdCheckCircle />
                                    </button>
                                    <button onClick={handleCancelEditField} className={`${styles.iconButton} ${styles.cancelIcon}`}>
                                        <MdCancel />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.fieldDisplay}>
                                <span className={styles.infoValue}>{unit.codigo_postal || '-'}</span>
                                <button
                                    onClick={() => handleStartEditingField('codigo_postal', unit.codigo_postal)}
                                    className={styles.editFieldButton}
                                >
                                    <MdEdit />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Fecha Creación</span>
                        <span className={styles.infoValue}>{formatDate(unit.fecha_creacion)}</span>
                    </div>
                </div>
            </div>

            {/* Permits Card */}
            <div className={`${styles.card} ${styles.permitsCard}`}>
                <div className={styles.permitHeaderSection}>
                    <h2 className={styles.cardHeader}>Permisos Asociados</h2>
                    <button
                        className={styles.addPermitButton}
                        onClick={() => setIsAddingPermit(!isAddingPermit)}
                    >
                        {isAddingPermit ? 'Cancelar' : 'Añadir Permiso'}
                    </button>
                </div>

                {/* Form para añadir nuevo permiso */}
                {isAddingPermit && (
                    <div className={styles.addPermitForm}>
                        <div className={styles.formGroup}>
                            <label>Tipo de Permiso</label>
                            <select
                                value={newPermit.permiso}
                                onChange={(e) => setNewPermit({ ...newPermit, permiso: e.target.value })}
                                className={styles.formSelect}
                            >
                                <option value="">Selecciona un permiso</option>
                                {availablePermits.map(permit => (
                                    <option key={permit} value={permit}>{permit}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Fecha de Vigencia</label>
                            <input
                                type="date"
                                value={newPermit.vigencia}
                                onChange={(e) => setNewPermit({ ...newPermit, vigencia: e.target.value })}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button
                                className={styles.addButton}
                                onClick={handleAddPermit}
                            >
                                Guardar Permiso
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.tableContainer}>
                    <table className={styles.permitsTable}>
                        <thead>
                            <tr>
                                <th>Permiso</th>
                                <th>Nueva Vigencia</th>
                                <th>Vigencia Actual</th>
                                <th>Estatus</th>
                                <th>Ponderación</th>
                                <th>Puntaje</th>
                                <th>Comentarios</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permits.length > 0 ? (
                                permits.map((permit) => <PermitRow key={permit.id} permit={permit} />)
                            ) : (
                                <tr>
                                    <td colSpan="8" className={styles.noResults}>
                                        Esta unidad no tiene permisos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UnitDetailScreen;