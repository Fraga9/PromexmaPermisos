// src/components/layout/Header.jsx
import React from 'react';
import styles from './Header.module.css';

function Header() {
  // Aquí podrías obtener info del usuario si implementas autenticación
  return (
    <header className={styles.header}>
      {/* Puedes poner un título dinámico o info del usuario */}
      <div className={styles.title}>Gestión de Cumplimiento</div>
      {/* <div className={styles.userInfo}>Usuario: Admin</div> */}
    </header>
  );
}

export default Header;