// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import styles from './Sidebar.module.css';

function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  // Overlay para cerrar tocando fuera en móvil
  const showOverlay = typeof window !== 'undefined' && window.innerWidth <= 768 && isSidebarOpen;

  // Cierra la sidebar al hacer clic en un enlace (en móvil)
  const handleNavClick = () => {
    if (window.innerWidth <= 768) closeSidebar();
  };

  return (
    <>
      {showOverlay && (
        <div className={styles.sidebarOverlay} onClick={closeSidebar} />
      )}
      <aside className={isSidebarOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}>
        <div className={styles.logo}>Promexma Permisos</div>
        <nav>
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                end // 'end' asegura que solo esté activo en la ruta exacta "/"
                onClick={handleNavClick}
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/unidades"
                className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                onClick={handleNavClick}
              >
                Unidades Operativas
              </NavLink>
            </li>
            {/* Añade más enlaces si es necesario */}
          </ul>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;