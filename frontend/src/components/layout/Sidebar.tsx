import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  Tooltip,
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
  Category as CategoryIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path?: string;
  children?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Mapa GIS', icon: <MapIcon />, path: '/mapa' },
  {
    text: 'Cadastro',
    icon: <HomeIcon />,
    children: [
      { text: 'Imóveis', icon: <HomeIcon />, path: '/cadastro/properties' },
      { text: 'Categorias', icon: <CategoryIcon />, path: '/cadastro/categories' },
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

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (text: string) => {
    if (!collapsed) {
      setOpenMenus((prev) => ({ ...prev, [text]: !prev[text] }));
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = openMenus[item.text];
    const isItemActive = isActive(item.path);

    if (item.children) {
      return (
        <Box key={item.text}>
          <Tooltip title={collapsed ? item.text : ''} placement="right">
            <ListItemButton
              onClick={() => handleToggle(item.text)}
              sx={{
                pl: collapsed ? 2 : 2 + depth * 2,
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                justifyContent: collapsed ? 'center' : 'flex-start',
                // Estilo para menu com submenus quando expandido
                backgroundColor: isExpanded ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&:hover': {
                  backgroundColor: isExpanded ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: isExpanded ? 'primary.main' : 'inherit',
                minWidth: collapsed ? 'auto' : 40,
              }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isExpanded ? 600 : 400,
                        color: isExpanded ? 'primary.main' : 'inherit',
                      }
                    }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </Tooltip>
          {!collapsed && (
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => renderMenuItem(child, depth + 1))}
              </List>
            </Collapse>
          )}
        </Box>
      );
    }

    return (
      <Tooltip key={item.text} title={collapsed ? item.text : ''} placement="right">
        <ListItemButton
          onClick={() => item.path && handleNavigate(item.path)}
          sx={{
            pl: collapsed ? 2 : 2 + depth * 2,
            mx: 1,
            my: 0.5,
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            justifyContent: collapsed ? 'center' : 'flex-start',
            // Estilo para menu simples quando ativo
            backgroundColor: isItemActive ? 'primary.main' : 'transparent',
            color: isItemActive ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: isItemActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
            },
            // Ícone e texto ficam brancos quando ativo
            '& .MuiListItemIcon-root': {
              color: isItemActive ? 'white' : 'inherit',
              minWidth: collapsed ? 'auto' : 40,
            },
            '& .MuiListItemText-root .MuiTypography-root': {
              fontWeight: isItemActive ? 600 : 400,
            },
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          {!collapsed && <ListItemText primary={item.text} />}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        flexShrink: 0,
        transition: 'width 0.3s ease-in-out',
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{
        px: 2,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        minHeight: '64px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <HomeIcon color="primary" sx={{ fontSize: 28 }} />
        {!collapsed && (
          <Box>
            <Typography variant="h6" fontWeight={600} lineHeight={1.2}>
              Salesópolis
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sistema de Cadastro
            </Typography>
          </Box>
        )}
      </Box>
      <List sx={{ pt: 1 }}>{menuItems.map((item) => renderMenuItem(item))}</List>
    </Drawer>
  );
}
