import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  Home as HomeIcon,
  Place as PlaceIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  IntegrationInstructions as IntegrationIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Mapa GIS', icon: <MapIcon />, path: '/mapa' },
  {
    text: 'Cadastro',
    icon: <HomeIcon />,
    children: [
      { text: 'Imóveis', icon: <HomeIcon />, path: '/cadastro/properties' },
    ],
  },
  {
    text: 'Endereçamento',
    icon: <PlaceIcon />,
    children: [
      { text: 'Endereços', icon: <PlaceIcon />, path: '/enderecamento/addresses' },
    ],
  },
  {
    text: 'Privacidade',
    icon: <SecurityIcon />,
    children: [
      { text: 'Dados Públicos', icon: <SecurityIcon />, path: '/privacy/public-data' },
      { text: 'Configurações DP', icon: <SecurityIcon />, path: '/privacy/settings' },
    ],
  },
  {
    text: 'Administração',
    icon: <PeopleIcon />,
    children: [
      { text: 'Usuários', icon: <PeopleIcon />, path: '/admin/users' },
      { text: 'Auditoria', icon: <HistoryIcon />, path: '/admin/audit' },
    ],
  },
  { text: 'Integrações', icon: <IntegrationIcon />, path: '/integracoes' },
  { text: 'Suporte', icon: <SupportIcon />, path: '/suporte/tickets' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (text: string) => {
    setOpenMenus((prev) => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (item.children) {
      return (
        <Box key={item.text}>
          <ListItemButton onClick={() => handleToggle(item.text)} sx={{ pl: 2 + depth * 2 }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItemButton
        key={item.text}
        onClick={() => item.path && handleNavigate(item.path)}
        sx={{ pl: 2 + depth * 2 }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HomeIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h6" fontWeight={600} lineHeight={1.2}>
            Salesópolis
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sistema de Cadastro
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ pt: 1 }}>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Drawer>
  );
}
