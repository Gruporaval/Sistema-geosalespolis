import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, AuthResponse, LoginCredentials, User } from '@/services/auth.service';
import { toast } from 'react-toastify';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresMfa: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
  requiresMfa: false,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Falha no login');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async () => {
  const user = await authService.getCurrentUser();
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRequiresMfa: (state, action: PayloadAction<boolean>) => {
      state.requiresMfa = action.payload;
    },
    // Auto-login para desenvolvimento/demonstração
    autoLogin: (state) => {
      const mockUser: User = {
        id: '1',
        name: 'Administrador Demo',
        email: 'admin@salesopolis.sp.gov.br',
        role: {
          id: 'admin-role',
          name: 'ADMIN',
          permissions: ['*'],
        },
        mfaEnabled: false,
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      state.user = mockUser;
      state.accessToken = mockToken;
      state.refreshToken = mockToken;
      state.isAuthenticated = true;
      state.requiresMfa = false;
      state.isLoading = false;
      state.error = null;

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('refreshToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        
        // Check if MFA is required
        if (action.payload?.requiresMfa) {
          state.requiresMfa = true;
          return;
        }

        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.requiresMfa = false;

        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));

        toast.success(`Bem-vindo, ${action.payload.user.name}!`);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        toast.info('Você saiu do sistema');
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(getCurrentUser.rejected, (state) => {
        // Não limpar estado em modo demo/mock
        const hasAccessToken = localStorage.getItem('accessToken');
        if (!hasAccessToken || !hasAccessToken.startsWith('mock-jwt-token')) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
        // Se for token mock, mantém autenticado mesmo com erro de API
      });
  },
});

export const { clearError, setRequiresMfa, autoLogin } = authSlice.actions;
export default authSlice.reducer;
