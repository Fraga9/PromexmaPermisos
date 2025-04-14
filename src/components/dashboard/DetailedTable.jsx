// src/components/dashboard/DetailedTable.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './DetailedTable.module.css';

function DetailedTable({ data }) {
  const [filters, setFilters] = useState({
    region: '',
    permitType: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    },
    searchTerm: ''
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  if (!data || data.length === 0) {
    return <div>No hay datos disponibles para la tabla</div>;
  }

  // Extraer opciones únicas para los filtros
  const regions = [...new Set(data.map(item => item.region))];
  const permitTypes = [...new Set(data.map(item => item.permitType))];
  const statuses = [...new Set(data.map(item => item.status))];

  // Función para manejar cambios en los filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Función para manejar cambios en el rango de fechas
  const handleDateRangeChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  // Función para ordenar
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrar y ordenar datos
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];
    
    // Aplicar filtros
    if (filters.region) {
      filtered = filtered.filter(item => item.region === filters.region);
    }
    
    if (filters.permitType) {
      filtered = filtered.filter(item => item.permitType === filters.permitType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.dateRange.start) {
      filtered = filtered.filter(item => 
        new Date(item.vigencia) >= new Date(filters.dateRange.start) // Use 'vigencia'
      );
    }
    
    if (filters.dateRange.end) {
      filtered = filtered.filter(item => 
        new Date(item.vigencia) <= new Date(filters.dateRange.end) // Use 'vigencia'
      );
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.permitName.toLowerCase().includes(term) || 
        item.unitName.toLowerCase().includes(term) ||
        item.comments?.toLowerCase().includes(term)
      );
    }
    
    // Ordenar datos
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [data, filters, sortConfig]);

  // Renderizar icono de ordenamiento
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className={styles.sortIcon} /> : 
      <ChevronDown className={styles.sortIcon} />;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <Filter className={styles.filterIcon} />
          
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todas las regiones</option>
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
          
          <select
            value={filters.permitType}
            onChange={(e) => handleFilterChange('permitType', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los tipos</option>
            {permitTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los estatus</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
            className={styles.dateInput}
            placeholder="Fecha inicio"
          />
          
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
            className={styles.dateInput}
            placeholder="Fecha fin"
          />
        </div>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('permiso')} className={styles.sortableHeader}>
                Permiso {renderSortIcon('permiso')}
              </th>
              <th onClick={() => handleSort('unidad')} className={styles.sortableHeader}>
                Unidad Operativa {renderSortIcon('unidad')}
              </th>
              <th onClick={() => handleSort('region')} className={styles.sortableHeader}>
                Región {renderSortIcon('region')}
              </th>
              <th onClick={() => handleSort('vigencia')} className={styles.sortableHeader}>
                Vigencia {renderSortIcon('vigencia')} {/* Use 'vigencia' */}
              </th>
              <th onClick={() => handleSort('estatus_req')} className={styles.sortableHeader}>
                Estatus {renderSortIcon('estatus_req')}
              </th>
              <th onClick={() => handleSort('puntaje')} className={styles.sortableHeader}>
                Puntaje {renderSortIcon('puntaje')}
              </th>
              <th>Comentarios</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map(item => (
                <tr key={item.id} className={getRowClass(item.estatus_req)}>
                  <td>{item.permiso}</td>
                  <td>{item.unidad}</td>
                  <td>{item.region}</td>
                  <td>{formatDate(item.vigencia)}</td> {/* Use 'vigencia' */}
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(item.estatus_req)}`}>
                      {item.estatus_req}
                    </span>
                  </td>
                  <td>{item.puntaje}</td>
                  <td>{item.comentarios || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  No se encontraron datos con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className={styles.tableFooter}>
        <span>Mostrando {filteredAndSortedData.length} de {data.length} registros</span>
      </div>
    </div>
  );
}

// Función para formatear fechas
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Función para determinar la clase CSS basada en el estatus
function getStatusClass(status) {
    switch (status) {
        case 'Cumplido':
        return styles.compliant;
        case 'Vencido':
        return styles.expired;
        case 'Por vencer':
        return styles.expiring;
        default:
        return styles.notApplicable;
    }
    }

// Función para determinar la clase CSS de la fila
function getRowClass(status) {
    switch (status) {
        case 'Cumplido':
        return styles.compliantRow;
        case 'Vencido':
        return styles.expiredRow;
        case 'Por vencer':
        return styles.expiringRow;
        default:
        return styles.notApplicableRow;
    }
}

export default DetailedTable;
