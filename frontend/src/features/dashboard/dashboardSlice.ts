import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

interface DashboardKPIs {
  totalProperties: number;
  propertiesWithAddress: number;
  propertiesWithGeometry: number;
  recadastrationProgress: number;
  activeTickets: number;
  resolvedTickets: number;
}

interface PropertiesByType {
  type: string;
  count: number;
}

interface PropertiesByDistrict {
  district: string;
  count: number;
}

interface DashboardState {
  kpis: DashboardKPIs | null;
  propertiesByType: PropertiesByType[];
  propertiesByDistrict: PropertiesByDistrict[];
  recentActivity: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  kpis: null,
  propertiesByType: [],
  propertiesByDistrict: [],
  recentActivity: [],
  isLoading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    // Modo demo: retorna dados mockados sem chamar API
    const token = localStorage.getItem('accessToken');
    if (token && token.startsWith('mock-jwt-token')) {
      return {
        kpis: {
          totalProperties: 15847,
          propertiesWithAddress: 14523,
          propertiesWithGeometry: 13891,
          recadastrationProgress: 87.5,
          activeTickets: 23,
          resolvedTickets: 156,
        },
        propertiesByType: [
          { type: 'Residencial', count: 12543 },
          { type: 'Comercial', count: 2187 },
          { type: 'Industrial', count: 456 },
          { type: 'Rural', count: 543 },
          { type: 'Público', count: 118 },
        ],
        propertiesByDistrict: [
          { district: 'Centro', count: 3245 },
          { district: 'Zona Norte', count: 4567 },
          { district: 'Zona Sul', count: 3891 },
          { district: 'Zona Leste', count: 2234 },
          { district: 'Zona Oeste', count: 1910 },
        ],
        recentActivity: [
          { id: 1, type: 'Cadastro', description: 'Novo imóvel cadastrado', date: new Date().toISOString() },
          { id: 2, type: 'Atualização', description: 'Endereço atualizado', date: new Date().toISOString() },
          { id: 3, type: 'Ticket', description: 'Ticket #245 resolvido', date: new Date().toISOString() },
        ],
      };
    }

    // Modo produção: chama API real
    const [kpis, byType, byDistrict, activity] = await Promise.all([
      api.get<{ data: DashboardKPIs }>('/dashboard/kpis'),
      api.get<{ data: PropertiesByType[] }>('/dashboard/properties-by-type'),
      api.get<{ data: PropertiesByDistrict[] }>('/dashboard/properties-by-district'),
      api.get<{ data: any[] }>('/dashboard/recent-activity'),
    ]);

    return {
      kpis: kpis.data.data,
      propertiesByType: byType.data.data,
      propertiesByDistrict: byDistrict.data.data,
      recentActivity: activity.data.data,
    };
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kpis = action.payload.kpis;
        state.propertiesByType = action.payload.propertiesByType;
        state.propertiesByDistrict = action.payload.propertiesByDistrict;
        state.recentActivity = action.payload.recentActivity;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar dashboard';
      });
  },
});

export default dashboardSlice.reducer;
