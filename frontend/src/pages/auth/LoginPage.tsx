import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login } from '@/features/auth/authSlice';
import { useThemeMode } from '@/ThemeContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { mode } = useThemeMode();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@salesopolis.sp.gov.br',
      password: 'admin123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login({
      email: data.email!,
      password: data.password!,
    }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: mode === 'light'
          ? 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)'
          : 'linear-gradient(to bottom right, #0f172a, #1e293b)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          boxShadow: mode === 'light'
            ? '0 10px 40px rgba(0, 0, 0, 0.08)'
            : '0 10px 40px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${mode === 'light' ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        {/* Logo e Título */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              mb: 2,
            }}
          >
            <HomeIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Bem-vindo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Entre com suas credenciais para continuar
          </Typography>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}
            >
              Email
            </Typography>
            <TextField
              {...register('email')}
              type="email"
              fullWidth
              placeholder="seu@email.com"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ mb: 0.5, display: 'block', color: 'text.secondary' }}
            >
              Senha
            </Typography>
            <TextField
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              placeholder="••••••••"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
            sx={{
              py: 1.25,
              borderRadius: 2,
              fontSize: '0.9375rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
              },
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* Credenciais de Demonstração */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" gutterBottom>
            Credenciais de demonstração
          </Typography>
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: 2,
              background: mode === 'light'
                ? alpha(theme.palette.primary.main, 0.04)
                : alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography variant="caption" fontFamily="monospace" display="block" sx={{ mb: 0.5 }}>
              <strong>Email:</strong> admin@salesopolis.sp.gov.br
            </Typography>
            <Typography variant="caption" fontFamily="monospace" display="block">
              <strong>Senha:</strong> admin123
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          © 2025 Prefeitura de Salesópolis
        </Typography>
      </Card>
    </Box>
  );
}
