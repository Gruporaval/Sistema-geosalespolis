import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { login } from '@/features/auth/authSlice';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  mfaCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, requiresMfa } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@salesopolis.sp.gov.br',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(login({
      email: data.email!,
      password: data.password!,
      mfaCode: data.mfaCode,
    }));
    if (login.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center" fontWeight={600}>
        Sistema de Cadastro
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        Prefeitura de Salesópolis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {requiresMfa && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Digite o código do seu autenticador
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('email')}
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          autoComplete="email"
          autoFocus
          disabled={requiresMfa}
        />

        <TextField
          {...register('password')}
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
          disabled={requiresMfa}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={requiresMfa}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {requiresMfa && (
          <TextField
            {...register('mfaCode')}
            label="Código MFA"
            fullWidth
            margin="normal"
            error={!!errors.mfaCode}
            helperText={errors.mfaCode?.message}
            inputProps={{ maxLength: 6 }}
            autoFocus
          />
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>

        <Box textAlign="center">
          <Link component={RouterLink} to="/forgot-password" variant="body2">
            Esqueceu a senha?
          </Link>
        </Box>
      </form>

      <Box mt={4} pt={2} borderTop="1px solid #e0e0e0" textAlign="center">
        <Typography variant="caption" color="text.secondary">
          © 2025 Prefeitura de Salesópolis. Todos os direitos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
