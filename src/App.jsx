// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardScreen from './screens/DashboardScreen';
import UnitsListScreen from './screens/UnitsListScreen';
import UnitDetailScreen from './screens/UnitDetailScreen';
import { AuthProvider } from './context/AuthContext.jsx'; // Import AuthProvider
import './App.css'; // Estilos generales de la app si los necesitas

function App() {
  return (
    <AuthProvider> {/* Envuelve la aplicación con AuthProvider */}
      <Layout> {/* Envuelve todas las rutas con el Layout */}
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/unidades" element={<UnitsListScreen />} />
          <Route path="/unidades/:id" element={<UnitDetailScreen />} />
          {/* Puedes añadir una ruta para página no encontrada */}
          <Route path="*" element={<div>404 - Página no encontrada</div>} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;