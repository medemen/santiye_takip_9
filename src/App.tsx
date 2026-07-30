import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { isLoggedIn, supabaseAuthInit } from './store/authStore';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  useEffect(() => { supabaseAuthInit(); }, []);

  return (
    <BrowserRouter basename="/santiye_takip_9">
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
    </BrowserRouter>
  );
}
