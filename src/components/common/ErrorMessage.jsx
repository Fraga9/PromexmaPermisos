// src/components/common/ErrorMessage.jsx
import React from 'react';
import styles from './ErrorMessage.module.css';

function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className={styles.error}>
      <strong>Error:</strong> {message}
    </div>
  );
}

export default ErrorMessage;