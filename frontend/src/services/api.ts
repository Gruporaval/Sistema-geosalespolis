// API desabilitada - usando Supabase diretamente
// Este arquivo existe apenas para evitar erros de importação

const api = {
  get: () => Promise.reject('API desabilitada'),
  post: () => Promise.reject('API desabilitada'),
  put: () => Promise.reject('API desabilitada'),
  patch: () => Promise.reject('API desabilitada'),
  delete: () => Promise.reject('API desabilitada'),
};

export default api;

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}
