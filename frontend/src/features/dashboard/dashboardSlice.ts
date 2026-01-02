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
    try {
      const { supabase } = await import('@/lib/supabase');

      // Buscar total de propriedades
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Buscar propriedades com endereço (zip_code preenchido)
      const { count: propertiesWithAddress } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .not('zip_code', 'is', null);

      // Buscar propriedades com geometria
      const { count: propertiesWithGeometry } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .not('coordinates', 'is', null);

      // Buscar propriedades por tipo
      const { data: propertiesByTypeData } = await supabase
        .from('properties')
        .select('property_type');

      // Agrupar por tipo
      const typeGroups: { [key: string]: number } = {};
      propertiesByTypeData?.forEach((prop) => {
        const type = prop.property_type || 'Não definido';
        typeGroups[type] = (typeGroups[type] || 0) + 1;
      });

      const propertiesByType = Object.entries(typeGroups).map(([type, count]) => ({
        type,
        count,
      }));

      // Buscar propriedades por bairro
      const { data: propertiesByDistrictData } = await supabase
        .from('properties')
        .select('neighborhood');

      // Agrupar por bairro
      const districtGroups: { [key: string]: number } = {};
      propertiesByDistrictData?.forEach((prop) => {
        const district = prop.neighborhood || 'Não definido';
        districtGroups[district] = (districtGroups[district] || 0) + 1;
      });

      const propertiesByDistrict = Object.entries(districtGroups).map(([district, count]) => ({
        district,
        count,
      }));

      // Calcular progresso de recadastramento
      const recadastrationProgress = totalProperties
        ? ((propertiesWithAddress || 0) / totalProperties) * 100
        : 0;

      return {
        kpis: {
          totalProperties: totalProperties || 0,
          propertiesWithAddress: propertiesWithAddress || 0,
          propertiesWithGeometry: propertiesWithGeometry || 0,
          recadastrationProgress: Number(recadastrationProgress.toFixed(1)),
          activeTickets: 0,
          resolvedTickets: 0,
        },
        propertiesByType: propertiesByType.length > 0 ? propertiesByType : [
          { type: 'Sem dados', count: 0 }
        ],
        propertiesByDistrict: propertiesByDistrict.length > 0 ? propertiesByDistrict : [
          { district: 'Sem dados', count: 0 }
        ],
        recentActivity: [],
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
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
