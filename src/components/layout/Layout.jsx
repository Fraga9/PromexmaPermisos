// src/components/layout/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css'; // Importa los estilos
import { Analytics } from "@vercel/analytics/react"

function Layout({ children }) {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header />
        <main className={styles.pageContent}>
          {children} {/* Aquí se renderizará el contenido de cada pantalla */}
          <Analytics />
        </main>
      </div>
    </div>
  );
}

export default Layout;