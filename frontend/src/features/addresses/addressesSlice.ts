import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { PaginatedResponse } from '@/services/api';

export interface Address {
  id: string;
  code: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  postalCode: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  geocodingSource?: 'MANUAL' | 'NOMINATIM' | 'INTERNAL';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  updatedAt: string;
}

interface AddressesState {
  items: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: AddressesState = {
  items: [],
  selectedAddress: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  },
};

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAll',
  async (params: { page?: number; pageSize?: number; search?: string }) => {
    const response = await api.get<PaginatedResponse<Address>>('/enderecamento/addresses', {
      params,
    });
    return response.data;
  },
);

export const geocodeAddress = createAsyncThunk(
  'addresses/geocode',
  async (addressId: string) => {
    const response = await api.post<{ data: Address }>(`/enderecamento/addresses/${addressId}/geocode`);
    return response.data.data;
  },
);

export const createAddress = createAsyncThunk(
  'addresses/create',
  async (data: Partial<Address>) => {
    const response = await api.post<{ data: Address }>('/enderecamento/addresses', data);
    return response.data.data;
  },
);

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar endereços';
      })
      .addCase(geocodeAddress.fulfilled, (state, action) => {
        const index = state.items.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { setSelectedAddress } = addressesSlice.actions;
export default addressesSlice.reducer;
