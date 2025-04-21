// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import LoginPopup from '../auth/LoginPopup';
import { FiMenu } from 'react-icons/fi';
import styles from './Header.module.css';

function Header() {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();
  const { toggleSidebar } = useSidebar();

  const handleOpenLoginPopup = () => {
    setIsLoginPopupOpen(true);
  };

  const handleCloseLoginPopup = () => {
    setIsLoginPopupOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className={styles.header}>
      {/* Botón hamburguesa solo en móvil */}
      <button
        className={styles.hamburger}
        onClick={toggleSidebar}
        aria-label="Abrir menú"
        type="button"
      >
        <FiMenu size={28} />
      </button>
      <div className={styles.title}>Gestión de Cumplimiento</div>
      
      <div className={styles.userSection}>
        {isAuthenticated ? (
          <div className={styles.userInfo}>
            <span>Usuario: {user.email}</span>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <button 
            onClick={handleOpenLoginPopup}
            className={styles.loginButton}
          >
            Iniciar Sesión
          </button>
        )}
      </div>

      <LoginPopup 
        isOpen={isLoginPopupOpen} 
        onClose={handleCloseLoginPopup} 
      />
    </header>
  );
}

export default Header;