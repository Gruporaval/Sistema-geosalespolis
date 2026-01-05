import { useState, useEffect } from 'react';
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
  AlertTitle,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ErrorOutline,
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
  const { mode } = useThemeMode();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Define a cor de fundo do body baseado no tema
  useEffect(() => {
    const bodyBg = mode === 'light' ? '#f3f4f6' : '#000000';
    document.body.style.backgroundColor = bodyBg;
    document.body.style.transition = 'background-color 0.3s ease';

    return () => {
      document.body.style.backgroundColor = '';
    };
  }, [mode]);

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

  // Cores baseadas no tema
  const colors = mode === 'light' ? {
    bg: '#f3f4f6', // Cinza para o fundo
    cardBg: '#ffffff',
    cardBorder: '#e5e7eb',
    titleColor: '#111827',
    labelColor: '#374151',
    inputBg: '#f9fafb',
    inputBorder: '#d1d5db',
    inputBorderHover: '#9ca3af',
    inputBorderFocus: '#1976d2', // Azul no foco
    inputText: '#111827',
    placeholderColor: '#9ca3af',
    buttonBg: '#1976d2', // Azul da paleta
    buttonText: '#ffffff',
    footerText: '#6b7280',
    errorBg: '#fef2f2',
    errorBorder: '#fecaca',
    errorText: '#991b1b',
    errorIcon: '#dc2626',
  } : {
    bg: '#000000',
    cardBg: '#1a1a1a',
    cardBorder: '#2a2a2a',
    titleColor: '#ffffff',
    labelColor: '#ffffff',
    inputBg: '#0a0a0a',
    inputBorder: '#2a2a2a',
    inputBorderHover: '#3a3a3a',
    inputBorderFocus: '#4a4a4a',
    inputText: '#ffffff',
    placeholderColor: '#666666',
    buttonBg: '#e8dcc8',
    buttonText: '#000000',
    footerText: '#999999',
    errorBg: '#2a1a1a',
    errorBorder: '#3a2a2a',
    errorText: '#ff6b6b',
    errorIcon: '#ff8866',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg,
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 2,
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h5"
            sx={{
              color: colors.titleColor,
              fontWeight: 700,
              fontSize: '1.5rem',
            }}
          >
            Entrar na sua conta
          </Typography>
        </Box>

        {/* Error Alert de Login */}
        {error && (
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{
              mb: 3,
              backgroundColor: colors.errorBg,
              color: colors.errorText,
              border: `1px solid ${colors.errorBorder}`,
              borderRadius: 1.5,
              '& .MuiAlert-icon': {
                color: colors.errorIcon,
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Erro ao fazer login</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Alerts de Validação */}
        {(errors.email || errors.password) && (
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{
              mb: 3,
              backgroundColor: colors.errorBg,
              color: colors.errorText,
              border: `1px solid ${colors.errorBorder}`,
              borderRadius: 1.5,
              '& .MuiAlert-icon': {
                color: colors.errorIcon,
              },
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Verifique os campos</AlertTitle>
            {errors.email && <Box sx={{ fontSize: '0.813rem', mb: errors.password ? 0.5 : 0 }}>• {errors.email.message}</Box>}
            {errors.password && <Box sx={{ fontSize: '0.813rem' }}>• {errors.password.message}</Box>}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                mb: 0.75,
                display: 'block',
                color: colors.labelColor,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Email
            </Typography>
            <TextField
              {...register('email')}
              type="email"
              fullWidth
              placeholder="seu@email.com"
              error={!!errors.email}
              autoComplete="email"
              autoFocus
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.inputText,
                  backgroundColor: colors.inputBg,
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: errors.email ? colors.errorIcon : colors.inputBorder,
                  },
                  '&:hover fieldset': {
                    borderColor: errors.email ? colors.errorIcon : colors.inputBorderHover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.email ? colors.errorIcon : colors.inputBorderFocus,
                  },
                },
                '& .MuiInputBase-input': {
                  color: colors.inputText,
                  '&::placeholder': {
                    color: colors.placeholderColor,
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Password */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: colors.labelColor,
                fontSize: '0.875rem',
                fontWeight: 500,
                mb: 0.75,
                display: 'block',
              }}
            >
              Senha
            </Typography>
            <TextField
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              placeholder="••••••••"
              error={!!errors.password}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: colors.placeholderColor }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.inputText,
                  backgroundColor: colors.inputBg,
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: errors.password ? colors.errorIcon : colors.inputBorder,
                  },
                  '&:hover fieldset': {
                    borderColor: errors.password ? colors.errorIcon : colors.inputBorderHover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: errors.password ? colors.errorIcon : colors.inputBorderFocus,
                  },
                },
                '& .MuiInputBase-input': {
                  color: colors.inputText,
                  '&::placeholder': {
                    color: colors.placeholderColor,
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Login Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.25,
              borderRadius: 1,
              fontSize: '0.938rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: colors.buttonBg,
              color: colors.buttonText,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: mode === 'light' ? '#1565c0' : '#f0e8d8',
                boxShadow: 'none',
              },
              '&:disabled': {
                backgroundColor: '#a8a8a8',
                color: '#666666',
              },
            }}
          >
            {isLoading ? <CircularProgress size={20} sx={{ color: colors.buttonText }} /> : 'Entrar'}
          </Button>
        </form>

        {/* Credenciais de Demonstração */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${colors.cardBorder}`,
          }}
        >
          <Typography
            variant="caption"
            color={colors.footerText}
            display="block"
            textAlign="center"
            gutterBottom
            sx={{ fontSize: '0.688rem', fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Credenciais de teste
          </Typography>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              background: colors.inputBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <Typography variant="caption" fontFamily="'Consolas', monospace" display="block" sx={{ mb: 0.5, fontSize: '0.75rem', color: colors.inputText }}>
              <Box component="span" sx={{ color: colors.footerText, mr: 1 }}>Email:</Box>
              <Box component="span" sx={{ color: colors.inputText, fontWeight: 500 }}>admin@salesopolis.sp.gov.br</Box>
            </Typography>
            <Typography variant="caption" fontFamily="'Consolas', monospace" display="block" sx={{ fontSize: '0.75rem', color: colors.inputText }}>
              <Box component="span" sx={{ color: colors.footerText, mr: 1 }}>Senha:</Box>
              <Box component="span" sx={{ color: colors.inputText, fontWeight: 500 }}>admin123</Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
