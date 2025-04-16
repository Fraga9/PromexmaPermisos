// src/screens/UnitsListScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './UnitsListScreen.module.css';

const ITEMS_PER_PAGE = 20; // Mantener la paginación en el frontend

function UnitsListScreen() {
  const [allUnits, setAllUnits] = useState([]); // Todas las unidades sin paginar
  const [displayedUnits, setDisplayedUnits] = useState([]); // Unidades filtradas y paginadas para mostrar
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    nombre: '',
    region: '',
    ordenCumplimiento: 'desc' // Nuevo filtro para ordenar por cumplimiento (desc por defecto)
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Función para obtener todas las unidades de una vez
  const fetchAllUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('unidades_operativas')
        .select('*, permisos(ponderacion, estatus_req)', { count: 'exact' })
        .order('nombre', { ascending: true });

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Calcular el porcentaje de cumplimiento para cada unidad
      const unitsWithCompliance = (data || []).map(unit => {
        const compliancePercentage = calculateCompliance(unit.permisos || []);
        return { ...unit, compliancePercentage };
      });

      setAllUnits(unitsWithCompliance);
      

      // Aplicar filtros y ordenamiento a los datos obtenidos
      applyFiltersAndPagination(unitsWithCompliance);

    } catch (err) {
      console.error("Error fetching units:", err);
      setError("No se pudieron cargar las unidades.");
      setAllUnits([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias porque cargamos todo al inicio

  // Función para calcular el cumplimiento
  const calculateCompliance = (permits) => {
    if (!permits || permits.length === 0) return 100;
    const totalPonderacion = permits.reduce((sum, p) => sum + (p.ponderacion || 0), 0);
    const currentPuntaje = permits.reduce((sum, p) => {
      const isCompliant = p.estatus_req === 'Vigente';
      return sum + (isCompliant ? (p.ponderacion || 0) : 0);
    }, 0);
    return totalPonderacion === 0 ? 100 : Math.round((currentPuntaje / totalPonderacion) * 100);
  };

  // Función para aplicar filtros y paginación a los datos ya cargados
  const applyFiltersAndPagination = useCallback((units = allUnits) => {
    let filteredUnits = [...units];

    // Aplicar filtro por nombre
    if (filters.nombre) {
      filteredUnits = filteredUnits.filter(unit =>
        unit.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    // Aplicar filtro por región
    if (filters.region) {
      filteredUnits = filteredUnits.filter(unit => unit.region === filters.region);
    }

    // Ordenar por cumplimiento
    filteredUnits.sort((a, b) => {
      if (filters.ordenCumplimiento === 'asc') {
        return a.compliancePercentage - b.compliancePercentage;
      } else {
        return b.compliancePercentage - a.compliancePercentage;
      }
    });

    // Guardar el recuento total
    setTotalCount(filteredUnits.length);

    // Aplicar paginación
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const paginatedUnits = filteredUnits.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    setDisplayedUnits(paginatedUnits);
  }, [filters, currentPage, allUnits]);

  // Cargar todas las unidades al inicio
  useEffect(() => {
    fetchAllUnits();
  }, [fetchAllUnits]);

  // Aplicar filtros y paginación cuando cambien los filtros o la página
  useEffect(() => {
    applyFiltersAndPagination();
  }, [applyFiltersAndPagination, filters, currentPage]);

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
        .select('region');

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
          placeholder="Buscar por nombre de unidad..."
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
          name="ordenCumplimiento"
          value={filters.ordenCumplimiento}
          onChange={handleFilterChange}
          className={styles.filterSelect}
        >
          <option value="desc">Cumplimiento: Mayor a Menor</option>
          <option value="asc">Cumplimiento: Menor a Mayor</option>
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
                {displayedUnits.length > 0 ? (
                  displayedUnits.map((unit) => (
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
                            unit.compliancePercentage >= 100
                              ? styles.highCompliance
                              : unit.compliancePercentage >= 80
                                ? styles.mediumCompliance
                                : styles.lowCompliance
                          }
                        >
                          {unit.compliancePercentage}%
                        </span>
                      </td>
                      <td>
                        <Link to={`/unidades/${unit.id}`} className={styles.actionLink}>
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))
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
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UnitsListScreen;