import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Pages & Components
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import EnergyDashboard from './pages/EnergyDashboard';
import EquipmentRegistry from './pages/EquipmentRegistry';
import Catalog from './pages/Catalog';
import History from './pages/History';
import ReportSystem from './pages/ReportSystem';
import AccountSettings from './pages/AccountSettings';
import SystemSettings from './pages/SystemSettings';
import AppLayout from './components/AppLayout';
import FactoriesList from './pages/FactoriesList';
import FactoryDetail from './pages/FactoryDetail';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AppContext);
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  React.useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="energy" element={<EnergyDashboard />} />
            <Route path="equip" element={<EquipmentRegistry />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="history" element={<History />} />
            <Route path="report" element={<ReportSystem />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="system" element={<SystemSettings />} />
            <Route path="factories" element={<FactoriesList />} />
            <Route path="factories/:factoryId" element={<FactoryDetail />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
