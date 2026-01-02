import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Badge,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout } from '@/features/auth/authSlice';
import { useThemeMode } from '@/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Header({ onToggleSidebar, sidebarCollapsed }: HeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 3 }}>
        <IconButton
          onClick={onToggleSidebar}
          edge="start"
          color="inherit"
          sx={{
            mr: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          {sidebarCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {/* Page title can be set here dynamically */}
        </Typography>

        <IconButton
          size="large"
          color="inherit"
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'scale(1.05)',
            }
          }}
        >
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box textAlign="right">
            <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
              {user?.role?.name}
            </Typography>
          </Box>
          <IconButton
            onClick={handleMenu}
            size="small"
            sx={{
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                minWidth: 280,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  mx: 1,
                  my: 0.5,
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Meu Perfil
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              toggleTheme();
              handleClose();
            }}
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon>
              {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={mode === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              secondary={mode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              primaryTypographyProps={{ fontSize: '0.875rem' }}
              secondaryTypographyProps={{ fontSize: '0.75rem' }}
            />
          </MenuItem>
          {/* Logout desabilitado - Auto-login ativo para demonstração */}
          {/* <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem> */}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
