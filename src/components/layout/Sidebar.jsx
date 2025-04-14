// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Promexma Permisos</div>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
              end // 'end' asegura que solo esté activo en la ruta exacta "/"
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/unidades"
              className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
            >
              Unidades Operativas
            </NavLink>
          </li>
          {/* Añade más enlaces si es necesario */}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;