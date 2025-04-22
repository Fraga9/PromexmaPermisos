import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { MdFileUpload, MdDelete, MdDownload, MdOutlineReport, MdNewReleases } from 'react-icons/md';
import { Tooltip } from 'react-tooltip';
import styles from './UnitUploadFile.module.css';
import { useAuth } from '../../context/AuthContext';

function UnitUploadFile({ permitId }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { isAuthenticated } = useAuth();
  const [newUploads, setNewUploads] = useState([]);

  useEffect(() => {
    if (permitId) {
      fetchFiles();
    }
  }, [permitId]);

  const fetchFiles = async () => {
    try {
      // Obtener documentos de la base de datos
      const { data, error } = await supabase
        .from('documentos_permisos')
        .select('*')
        .eq('permiso_id', permitId)
        .order('fecha_subida', { ascending: false });

      if (error) throw error;
      
      // Check for new files (less than 24 hours old)
      const now = new Date();
      const newFiles = (data || []).filter(file => {
        const uploadDate = new Date(file.fecha_subida);
        const hoursSinceUpload = (now - uploadDate) / (1000 * 60 * 60);
        return hoursSinceUpload < 24;
      });
      
      setNewUploads(newFiles.map(f => f.id));
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Verificar si ya hay 5 archivos
      if (files.length >= 5) {
        setUploadError('Solo se permiten 5 archivos por permiso.');
        return;
      }

      // Verificar el tamaño del archivo (máximo 5MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede ser mayor a 10MB.');
        return;
      }

      setUploading(true);
      setUploadError(null);

      // Crear un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${permitId}_${Date.now()}.${fileExt}`;
      const filePath = `permit_documents/${fileName}`;

      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('permisos_documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Registrar documento en la base de datos
      const { error: dbError } = await supabase
        .from('documentos_permisos')
        .insert([
          {
            permiso_id: permitId,
            nombre_archivo: file.name,
            ruta_archivo: filePath,
          }
        ]);

      if (dbError) throw dbError;

      // Mostrar mensaje de éxito y actualizar lista
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      fetchFiles();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadError('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
      // Limpiar el input file
      event.target.value = null;
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

  const handleDeleteFile = async (fileId, filePath) => {
    if (!isAuthenticated) return;
    
    if (confirm('¿Está seguro de eliminar este documento?')) {
      try {
        // Eliminar archivo del storage
        const { error: storageError } = await supabase.storage
          .from('permisos_documentos')
          .remove([filePath]);

        if (storageError) throw storageError;

        // Eliminar registro de la base de datos
        const { error: dbError } = await supabase
          .from('documentos_permisos')
          .delete()
          .eq('id', fileId);

        if (dbError) throw dbError;

        // Actualizar lista
        fetchFiles();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const isNewUpload = (fileId) => {
    return newUploads.includes(fileId);
  };

  return (
    <div className={styles.uploadFileContainer}>
      {files.length > 0 && (
        <div className={styles.filesList}>
          <h4>Documentos asociados:</h4>
          <ul>
            {files.map(file => (
              <li key={file.id} className={`${styles.fileItem} ${isNewUpload(file.id) ? styles.newUpload : ''}`}>
                <div className={styles.fileNameContainer}>
                  {isNewUpload(file.id) && (
                    <span className={styles.newFileIndicator}>
                      <MdNewReleases />
                      <span className={styles.newFileText}>Nuevo</span>
                    </span>
                  )}
                  <span className={styles.fileName} title={file.nombre_archivo}>
                    {file.nombre_archivo.length > 20 
                      ? file.nombre_archivo.substring(0, 17) + '...' 
                      : file.nombre_archivo}
                  </span>
                </div>
                
                <div className={styles.fileActions}>
                  <MdDownload 
                    onClick={() => handleDownloadFile(file)}
                    className={styles.actionIcon}
                    title="Descargar"
                  />
                  
                  {isAuthenticated && (
                    <MdDelete 
                      onClick={() => handleDeleteFile(file.id, file.ruta_archivo)}
                      className={`${styles.actionIcon} ${styles.deleteIcon}`}
                      title="Eliminar documento"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length < 5 && (
        <div className={styles.uploadControls}>
          <label className={styles.uploadButton}>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={styles.fileInput}
            />
            <MdFileUpload /> {uploading ? 'Subiendo...' : 'Subir documento'}
          </label>

          {uploadError && (
            <div className={styles.uploadError}>
              <MdOutlineReport /> {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className={styles.uploadSuccess}>
              Documento subido exitosamente
            </div>
          )}

          <div className={styles.uploadHelp}>
            <small>Formatos permitidos: PDF, DOC, DOCX, JPG, PNG (máx. 10MB)</small>
          </div>
        </div>
      )}

      {files.length >= 5 && (
        <div className={styles.limitMessage}>
          Se ha alcanzado el límite de 5 documentos por permiso.
        </div>
      )}
    </div>
  );
}

export default UnitUploadFile;
