// src/screens/DashboardScreen.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import KPICards from '../components/dashboard/KPICards';
import WeightedRegionComplianceChart from '../components/dashboard/WeightedRegionComplianceChart';
import ComplianceHeatMap from '../components/dashboard/ComplianceHeatMap';
import UnitRanking from '../components/dashboard/UnitRanking';
import PermitTimeline from '../components/dashboard/PermitTimeline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './DashboardScreen.module.css';
import RecentUploadsCard from './components/RecentUploadsCard';
import { Link } from 'react-router-dom';
import { MdDashboard, MdFolder, MdInsertChart, MdPerson } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

function DashboardScreen() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // Llamada a función RPC en Supabase para obtener todos los datos del dashboard
        const { data, error: rpcError } = await supabase.rpc('get_dashboard_data');

        if (rpcError) throw rpcError;
        setDashboardData(data || {});
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('No se pudieron cargar los datos del dashboard. Intenta de nuevo más tarde.');
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className={styles.loadingContainer}><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className={styles.screenContainer}>
      <h1>Dashboard de Cumplimiento de Permisos</h1>
      <ErrorMessage message={error} />

      {/* Sección 1: KPIs principales */}
      <section className={styles.section}>
        <h2>KPIs Principales</h2>
        <KPICards data={dashboardData?.kpis} />
      </section>

      {/* Sección 2: Gráfica de barras por estatus */}
      <section className={styles.section}>
        <WeightedRegionComplianceChart data={dashboardData?.complianceByRegion} />
      </section>

      <div className={styles.gridContainer}>
        {/* Sección 3: Mapa de calor o matriz de cumplimiento */}
        <section className={styles.gridItem}>
          <h2>Matriz de Cumplimiento</h2>
          <ComplianceHeatMap data={dashboardData?.complianceMatrix} />
        </section>

        {/* Sección 4: Ranking de unidades operativas */}
        <section className={styles.gridItem}>
          <h2>Ranking de Unidades Operativas</h2>
          <UnitRanking data={dashboardData?.unitRanking} />
        </section>
      </div>

      {/* Sección 5: Timeline de vigencia */}
      <section className={styles.section}>
        <h2>Timeline de Permisos Críticos</h2>
        <PermitTimeline data={dashboardData?.permitTimeline} />
      </section>

      {/* Sección 6: Documentos recientes - solo visible para usuarios autenticados */}

      <section className={styles.section}>
        <h2>Documentos Recientes</h2>
        <RecentUploadsCard />
      </section>
    </div>
  );
}

export default DashboardScreen;