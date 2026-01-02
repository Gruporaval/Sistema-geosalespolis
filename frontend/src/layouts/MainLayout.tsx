import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Verifica se é a página de mapa para remover o padding
  const isMapPage = location.pathname === '/mapa';

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: isMapPage ? 0 : 3, // Padding zero no mapa
            overflow: 'auto', // Mapa gerencia seu próprio scroll (hidden)
            backgroundColor: 'background.default',
            position: 'relative' // Importante para o mapa absoluto funcionar
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
