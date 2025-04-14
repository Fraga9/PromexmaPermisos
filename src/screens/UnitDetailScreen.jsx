import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './UnitDetailScreen.module.css';
import { MdArrowBack } from 'react-icons/md';

// Import components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import UnitHeader from './components/UnitHeader';
import UnitInfoCard from './components/UnitInfoCard';
import PermitsCard from './components/PermitsCard';
import Toast from './components/Toast';

// Helper for calculating compliance percentage
const calculateCompliance = (permits) => {
  if (!permits || permits.length === 0) return 100;

  const totalPonderacion = permits.reduce((sum, p) => sum + (p.ponderacion || 0), 0);
  if (totalPonderacion === 0) return 100;

  const currentPuntaje = permits.reduce((sum, p) => {
    const isCompliant = p.estatus_req === 'Vigente';
    return sum + (isCompliant ? (p.ponderacion || 0) : 0);
  }, 0);

  return Math.round((currentPuntaje / totalPonderacion) * 100);
};

function UnitDetailScreen() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compliancePercentage, setCompliancePercentage] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  // Toast notification handler
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 3000);
  };

  // Fetch unit data and related permits
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load unit data
      const { data: unitData, error: unitError } = await supabase
        .from('unidades_operativas')
        .select('*')
        .eq('id', id)
        .single();

      if (unitError) throw unitError;
      setUnit(unitData);

      // Load associated permits
      const { data: permitsData, error: permitsError } = await supabase
        .from('permisos')
        .select('*')
        .eq('unidad_operativa_id', id)
        .order('permiso', { ascending: true });

      if (permitsError) throw permitsError;
      setPermits(permitsData || []);

      // Calculate compliance percentage
      setCompliancePercentage(calculateCompliance(permitsData || []));
    } catch (err) {
      console.error("Error fetching unit details:", err);
      setError("No se pudieron cargar los detalles de la unidad o sus permisos.");
      setUnit(null);
      setPermits([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle unit data updates
  const handleUnitUpdate = async (updatedData) => {
    try {
      const { error } = await supabase
        .from('unidades_operativas')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      showToast('Información actualizada correctamente');
      fetchData(); // Reload data to reflect changes
    } catch (err) {
      console.error("Error updating unit:", err);
      showToast(`Error al actualizar: ${err.message}`, 'error');
    }
  };

  // Handle permit operations (CRUD)
  const handlePermitOperation = {
    add: async (newPermit) => {
      try {
        const permitToAdd = {
          ...newPermit,
          unidad_operativa: unit.nombre,
          unidad_operativa_id: unit.id,
          region: unit.region || ''
        };

        const { error } = await supabase
          .from('permisos')
          .insert([permitToAdd]);

        if (error) throw error;

        showToast('Permiso añadido correctamente');
        fetchData();
        return true;
      } catch (err) {
        console.error("Error adding permit:", err);
        showToast(`Error al añadir permiso: ${err.message}`, 'error');
        return false;
      }
    },
    update: async (permitId, updateData) => {
      try {
        const { error } = await supabase
          .from('permisos')
          .update(updateData)
          .eq('id', permitId);

        if (error) throw error;

        showToast('Permiso actualizado correctamente');
        fetchData();
        return true;
      } catch (err) {
        console.error("Error updating permit:", err);
        showToast(`Error al actualizar permiso: ${err.message}`, 'error');
        return false;
      }
    },
    delete: async (permitId) => {
      try {
        const { error } = await supabase
          .from('permisos')
          .delete()
          .eq('id', permitId);

        if (error) throw error;

        showToast('Permiso eliminado correctamente');
        fetchData();
        return true;
      } catch (err) {
        console.error("Error deleting permit:", err);
        showToast(`Error al eliminar permiso: ${err.message}`, 'error');
        return false;
      }
    }
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
        <Toast message={toast.message} type={toast.type} />
      )}

      {/* Header with back button */}
      <div className={styles.headerWrapper}>
        <Link to="/unidades" className={styles.backLink}>
          <MdArrowBack /> <span>Volver a la lista</span>
        </Link>

        {/* Unit header with title and compliance indicator */}
        <UnitHeader 
          unit={unit} 
          compliancePercentage={compliancePercentage}
          onUpdateTitle={(title) => handleUnitUpdate({ nombre: title })} 
        />
      </div>

      {/* Unit information card */}
      <UnitInfoCard 
        unit={unit} 
        onUpdateField={handleUnitUpdate} 
      />

      {/* Permits management card */}
      <PermitsCard 
        permits={permits}
        unit={unit}
        onAddPermit={handlePermitOperation.add}
        onUpdatePermit={handlePermitOperation.update}
        onDeletePermit={handlePermitOperation.delete}
      />
    </div>
  );
}

export default UnitDetailScreen;