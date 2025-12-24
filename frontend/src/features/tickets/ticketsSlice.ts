import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { PaginatedResponse } from '@/services/api';

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'TECHNICAL' | 'FUNCTIONAL' | 'DATA' | 'TRAINING' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  requesterId: string;
  requester?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  slaDeadline: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  message: string;
  isInternal: boolean;
  createdAt: string;
}

interface TicketsState {
  items: Ticket[];
  selectedTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const initialState: TicketsState = {
  items: [],
  selectedTicket: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  },
};

export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (params: { page?: number; pageSize?: number; status?: string }) => {
    const response = await api.get<PaginatedResponse<Ticket>>('/suporte/tickets', {
      params,
    });
    return response.data;
  },
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchById',
  async (id: string) => {
    const response = await api.get<{ data: Ticket }>(`/suporte/tickets/${id}`);
    return response.data.data;
  },
);

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (data: Partial<Ticket>) => {
    const response = await api.post<{ data: Ticket }>('/suporte/tickets', data);
    return response.data.data;
  },
);

export const addTicketMessage = createAsyncThunk(
  'tickets/addMessage',
  async ({ ticketId, message }: { ticketId: string; message: string }) => {
    const response = await api.post<{ data: TicketMessage }>(
      `/suporte/tickets/${ticketId}/messages`,
      { message },
    );
    return response.data.data;
  },
);

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Erro ao carregar tickets';
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.selectedTicket = action.payload;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addTicketMessage.fulfilled, (state, action) => {
        if (state.selectedTicket) {
          if (!state.selectedTicket.messages) {
            state.selectedTicket.messages = [];
          }
          state.selectedTicket.messages.push(action.payload);
        }
      });
  },
});

export const { setSelectedTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;
