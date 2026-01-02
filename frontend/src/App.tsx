import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from './hooks/redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MapPage from './pages/map/MapPage';
import PropertiesPage from './pages/properties/PropertiesPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import AddressesPage from './pages/addresses/AddressesPage';
import TicketsPage from './pages/tickets/TicketsPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import UsersPage from './pages/admin/UsersPage';
import AuditPage from './pages/admin/AuditPage';
import PublicDataPage from './pages/privacy/PublicDataPage';
import PrivacySettingsPage from './pages/privacy/PrivacySettingsPage';
import IntegrationsPage from './pages/integrations/IntegrationsPage';
import NotFoundPage from './pages/NotFoundPage';

// Route Guards
import PrivateRoute from './components/guards/PrivateRoute';
import PublicRoute from './components/guards/PublicRoute';

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Mostrar loading apenas se estiver carregando
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Private Routes - Auto-login ativado */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/cadastro/properties" element={<PropertiesPage />} />
          <Route path="/cadastro/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/cadastro/categories" element={<CategoriesPage />} />
          <Route path="/enderecamento/addresses" element={<AddressesPage />} />
          <Route path="/privacy/public-data" element={<PublicDataPage />} />
          <Route path="/privacy/settings" element={<PrivacySettingsPage />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/audit" element={<AuditPage />} />
          <Route path="/integracoes" element={<IntegrationsPage />} />
          <Route path="/suporte/tickets" element={<TicketsPage />} />
          <Route path="/suporte/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Login oculto - disponível apenas via URL direta */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
