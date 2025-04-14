// src/screens/UnitsListScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './UnitsListScreen.module.css';

const ITEMS_PER_PAGE = 20; // O el número que prefieras

function UnitsListScreen() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ nombre: '', region: '', activo: 'true' }); // Filtros iniciales
  const [currentPage, setCurrentPage] = useState(0); // Página actual (0 indexada)
  const [totalCount, setTotalCount] = useState(0); // Total de unidades que coinciden

   // Función para obtener unidades, memoizada con useCallback
  const fetchUnits = useCallback(async (page) => {
    setLoading(true);
    setError(null);
    try {
      const from = page * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('unidades_operativas')
        .select('*, permisos(ponderacion, estatus_req)', { count: 'exact' }) // Include permisos for compliance calculation
        .order('nombre', { ascending: true }) // Ordenar alfabéticamente por nombre
        .range(from, to); // Aplicar paginación

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`); // Búsqueda insensible a mayúsculas
      }
      if (filters.region) {
        query = query.eq('region', filters.region);
      }
       if (filters.activo !== '') { // Si no es 'todos'
         query = query.eq('activo', filters.activo === 'true');
       }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      setUnits(data || []);
      setTotalCount(count || 0);

    } catch (err) {
      console.error("Error fetching units:", err);
      setError("No se pudieron cargar las unidades.");
      setUnits([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Depende de los filtros

  const calculateCompliance = (permits) => {
    if (!permits || permits.length === 0) return 100;
    const totalPonderacion = permits.reduce((sum, p) => sum + (p.ponderacion || 0), 0);
    const currentPuntaje = permits.reduce((sum, p) => {
      const isCompliant = p.estatus_req === 'Vigente';
      return sum + (isCompliant ? (p.ponderacion || 0) : 0);
    }, 0);
    return Math.round((currentPuntaje / totalPonderacion) * 100);
  };

  // Efecto para cargar datos cuando cambian los filtros o la página
  useEffect(() => {
    fetchUnits(currentPage);
  }, [fetchUnits, currentPage]); // Depende de fetchUnits (que depende de filters) y currentPage

  // Manejadores para los filtros
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setCurrentPage(0); // Resetear a la primera página al cambiar filtros
  };

  // Manejadores para paginación
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
   const nextPage = () => {
       if (currentPage < totalPages - 1) {
           setCurrentPage(currentPage + 1);
       }
   };
   const prevPage = () => {
       if (currentPage > 0) {
           setCurrentPage(currentPage - 1);
       }
   };


  // Obtener lista única de regiones para el dropdown
  const [regions, setRegions] = useState([]);
  useEffect(() => {
      async function fetchRegions() {
          const { data, error } = await supabase
              .from('unidades_operativas')
              .select('region')

          if (data) {
               // Obtener regiones únicas y filtrar nulos/vacíos si es necesario
               const uniqueRegions = [...new Set(data.map(u => u.region).filter(Boolean))];
               setRegions(uniqueRegions.sort());
          }
      }
      fetchRegions();
  }, []);


  return (
    <div className={styles.screenContainer}>
      <h1>Unidades Operativas</h1>
      <ErrorMessage message={error} />

      {/* Filtros */}
      <div className={styles.filters}>
        <input
          type="text"
          name="nombre"
          placeholder="Buscar por nombre..."
          value={filters.nombre}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <select
           name="region"
           value={filters.region}
           onChange={handleFilterChange}
           className={styles.filterSelect}
         >
           <option value="">Todas las Regiones</option>
           {regions.map(region => (
               <option key={region} value={region}>{region}</option>
           ))}
         </select>
         <select
           name="activo"
           value={filters.activo}
           onChange={handleFilterChange}
           className={styles.filterSelect}
         >
           <option value="">Todos los Estados</option>
           <option value="true">Activo</option>
           <option value="false">Inactivo</option>
         </select>
      </div>

      {/* Tabla de Unidades */}
      {loading ? (
        <div className={styles.loadingContainer}><LoadingSpinner /></div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.unitsTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Región</th>
                  <th>Estado</th>
                  <th>Cumplimiento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {units.length > 0 ? (
                  units.map((unit) => {
                    const compliancePercentage = calculateCompliance(unit.permisos || []);
                    return (
                      <tr key={unit.id}>
                        <td>{unit.id}</td>
                        <td>{unit.nombre}</td>
                        <td>{unit.region || '-'}</td>
                        <td>
                          <span className={unit.activo ? styles.statusActive : styles.statusInactive}>
                            {unit.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              compliancePercentage >= 100
                                ? styles.highCompliance
                                : compliancePercentage >= 80
                                ? styles.mediumCompliance
                                : styles.lowCompliance
                            }
                          >
                            {compliancePercentage}%
                          </span>
                        </td>
                        <td>
                          <Link to={`/unidades/${unit.id}`} className={styles.actionLink}>
                            Ver Detalles
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className={styles.noResults}>No se encontraron unidades con los filtros aplicados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button onClick={prevPage} disabled={currentPage === 0}>
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages} ({totalCount} resultados)
              </span>
              <button onClick={nextPage} disabled={currentPage >= totalPages - 1}>
                Siguiente
              </button>
              {/* Podrías añadir números de página aquí si quieres */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UnitsListScreen;