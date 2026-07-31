import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdaList from './pages/AdaList';
import AdaDetail from './pages/AdaDetail';
import BlokDetail from './pages/BlokDetail';
import ReportAdd from './pages/ReportAdd';
import ReportList from './pages/ReportList';
import BulkReport from './pages/BulkReport';
import Personnel from './pages/Personnel';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { isLoggedIn, supabaseAuthInit, subscribeAuthChanges } from './store/authStore';
import { supabaseRaporlariYukle, aboneOlRaporGuncellemeleri, realtimeRaporAboneliktenCik } from './store/reportStore';
import { supabaseAtamalariYukle, aboneOlAtamaGuncellemeleri, realtimeAtamaAboneliktenCik } from './store/atamaStore';
import { isSupabaseReady } from './lib/supabase';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

const isNative = Capacitor.isNativePlatform();
const AppRouter = isNative ? HashRouter : BrowserRouter;

export default function App() {
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => { supabaseAuthInit(); }, []);
  useEffect(() => subscribeAuthChanges(() => setAuthTick(t => t + 1)), []);

  useEffect(() => {
    if (!isLoggedIn() || !isSupabaseReady()) return;

    Promise.all([supabaseRaporlariYukle(), supabaseAtamalariYukle()]);

    aboneOlRaporGuncellemeleri();
    aboneOlAtamaGuncellemeleri();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabaseRaporlariYukle();
        supabaseAtamalariYukle();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      realtimeRaporAboneliktenCik();
      realtimeAtamaAboneliktenCik();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [authTick]);

  return (
    <AppRouter basename={isNative ? undefined : '/santiye_takip_9'}>
      <ErrorBoundary>
        <>
          <Toast />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/adalar" element={<AdaList />} />
                      <Route path="/ada/:ada" element={<AdaDetail />} />
                      <Route path="/ada/:ada/blok/:blokNo" element={<BlokDetail />} />
                      <Route path="/rapor-ekle" element={<ReportAdd />} />
                      <Route path="/raporlar" element={<ReportList />} />
                      <Route path="/personel" element={<Personnel />} />
                  <Route path="/toplu-rapor" element={<BulkReport />} />
                      <Route path="/profil" element={<Profile />} />
                      <Route path="/istatistik" element={<Statistics />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </>
      </ErrorBoundary>
    </AppRouter>
  );
}
