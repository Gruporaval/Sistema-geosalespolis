import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { PaginatedResponse } from '@/services/api';

export interface Property {
  id: string;
  code: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'RURAL' | 'MIXED' | 'VACANT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';
  landArea: number;
  builtArea?: number;
  ownerName: string;
  ownerDocument: string;
  ownerPhone?: string;
  ownerEmail?: string;
  digitalAddress?: {
    id: string;
    code: string;
    street: string;
    number: string;
    district: string;
  };
  geometry?: {
    type: string;
    coordinates: number[];
  };
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PropertiesState {
  items: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  filters: {
    search?: string;
    type?: Property['type'];
    status?: Property['status'];
    district?: string;
  };
}

const initialState: PropertiesState = {
  items: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  },
  filters: {},
};

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (params: { page?: number; pageSize?: number; filters?: any }) => {
    const response = await api.get<PaginatedResponse<Property>>('/cadastro/properties', {
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        ...params.filters,
      },
    });
    return response.data;
  },
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id: string) => {
    const response = await api.get<{ data: Property }>(`/cadastro/properties/${id}`);
    return response.data.data;
  },
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (data: Partial<Property>) => {
    const response = await api.post<{ data: Property }>('/cadastro/properties', data);
    return response.data.data;
  },
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, data }: { id: string; data: Partial<Property> }) => {
    const response = await api.patch<{ data: Property }>(`/cadastro/properties/${id}`, data);
    return response.data.data;
  },
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id: string) => {
    await api.delete(`/cadastro/properties/${id}`);
    return id;
  },
);

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar propriedades';
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.selectedProperty = action.payload;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProperty?.id === action.payload.id) {
          state.selectedProperty = action.payload;
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selectedProperty?.id === action.payload) {
          state.selectedProperty = null;
        }
      });
  },
});

export const { setFilters, clearFilters, setSelectedProperty } = propertiesSlice.actions;
export default propertiesSlice.reducer;
