import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { MdDownload, MdOpenInNew, MdOutlineUpdateDisabled } from 'react-icons/md';
import styles from './RecentUploadsCard.module.css';
import { useAuth } from '../../context/AuthContext';

// Helper to format time elapsed
const formatTimeElapsed = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  
  const uploadDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - uploadDate) / 1000);
  
  if (diffInSeconds < 60) return 'Hace unos segundos';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  
  return `${uploadDate.toLocaleDateString()}, ${uploadDate.toLocaleTimeString()}`;
};

function RecentUploadsCard() {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchRecentUploads();
  }, []);

  
  const fetchRecentUploads = async () => {
    try {
      setLoading(true);
      
      // Obtener archivos subidos en las últimas 72 horas con información del permiso y unidad
      const { data, error } = await supabase
        .from('documentos_permisos')
        .select(`
          *,
          permisos:permiso_id (
            id,
            permiso,
            unidad_operativa,
            unidad_operativa_id
          )
        `)
        .gte('fecha_subida', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
        .order('fecha_subida', { ascending: false });
        
      if (error) throw error;
      
      setRecentFiles(data || []);
    } catch (err) {
      console.error('Error fetching recent uploads:', err);
      setError('No se pudieron cargar los archivos recientes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadFile = async (file) => {
    try {
      const { data, error } = await supabase.storage
        .from('permisos_documentos')
        .download(file.ruta_archivo);
        
      if (error) throw error;
      
      // Crear URL para descarga
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.nombre_archivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  const navigateToPermit = (unitId) => {
    navigate(`/unidades/${unitId}`);
  };

  
  return (
    <div className={styles.card}>
      {loading ? (
        <div className={styles.loadingState}>Cargando documentos recientes...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : recentFiles.length === 0 ? (
        <div className={styles.emptyState}>
          <MdOutlineUpdateDisabled className={styles.emptyIcon} />
          <p>No hay documentos subidos en las últimas 72 horas</p>
        </div>
      ) : (
        <div className={styles.fileListContainer}>
          <table className={styles.fileTable}>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Unidad</th>
                <th>Permiso</th>
                <th>Subido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentFiles.map((file) => (
                <tr key={file.id} className={styles.fileRow}>
                  <td className={styles.fileName}>{file.nombre_archivo}</td>
                  <td>{file.permisos?.unidad_operativa || 'N/A'}</td>
                  <td>{file.permisos?.permiso || 'N/A'}</td>
                  <td>{formatTimeElapsed(file.fecha_subida)}</td>
                  <td className={styles.fileActions}>
                    <MdDownload 
                      onClick={() => handleDownloadFile(file)}
                      className={styles.actionIcon}
                      title="Descargar archivo"
                    />
                    <MdOpenInNew 
                      onClick={() => navigateToPermit(file.permisos?.unidad_operativa_id)}
                      className={`${styles.actionIcon} ${styles.openIcon}`}
                      title="Ver unidad operativa"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentUploadsCard;
