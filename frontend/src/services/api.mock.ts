import { AxiosInstance } from 'axios';

// Mock data
const mockUser = {
  id: '1',
  email: 'admin@salesopolis.sp.gov.br',
  name: 'Administrador',
  role: {
    id: '1',
    name: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: [
      { id: '1', code: 'properties:read', name: 'Ver imóveis' },
      { id: '2', code: 'properties:write', name: 'Editar imóveis' },
      { id: '3', code: 'gis:read', name: 'Ver mapas' },
      { id: '4', code: 'gis:write', name: 'Editar mapas' },
      { id: '5', code: 'users:read', name: 'Ver usuários' },
      { id: '6', code: 'users:write', name: 'Editar usuários' },
      { id: '7', code: 'dashboard:read', name: 'Ver dashboard' },
      { id: '8', code: 'reports:read', name: 'Ver relatórios' },
    ],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockProperties = [
  {
    id: '1',
    code: 'IM-2025-001',
    type: 'RESIDENTIAL',
    status: 'ACTIVE',
    landArea: 450.5,
    builtArea: 180.3,
    ownerName: 'João Silva Santos',
    ownerDocument: '12345678901',
    address: 'Rua das Flores, 123',
    district: 'Centro',
    city: 'Salesópolis',
    state: 'SP',
    zipCode: '08970-000',
    latitude: -23.5305,
    longitude: -45.8474,
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-12-20T14:22:00Z',
  },
  {
    id: '2',
    code: 'IM-2025-002',
    type: 'COMMERCIAL',
    status: 'ACTIVE',
    landArea: 850.0,
    builtArea: 420.0,
    ownerName: 'Maria Oliveira Costa',
    ownerDocument: '98765432109',
    address: 'Av. Principal, 456',
    district: 'Centro',
    city: 'Salesópolis',
    state: 'SP',
    zipCode: '08970-000',
    latitude: -23.5315,
    longitude: -45.8484,
    createdAt: '2025-02-10T09:15:00Z',
    updatedAt: '2025-12-18T11:45:00Z',
  },
  {
    id: '3',
    code: 'IM-2025-003',
    type: 'INDUSTRIAL',
    status: 'PENDING',
    landArea: 2500.0,
    builtArea: 1200.0,
    ownerName: 'Empresa XYZ Ltda',
    ownerDocument: '12345678000190',
    address: 'Rodovia SP-088, Km 15',
    district: 'Distrito Industrial',
    city: 'Salesópolis',
    state: 'SP',
    zipCode: '08970-000',
    latitude: -23.5405,
    longitude: -45.8574,
    createdAt: '2025-03-05T15:20:00Z',
    updatedAt: '2025-12-22T16:30:00Z',
  },
];

const mockDashboardData = {
  kpis: {
    totalProperties: 1847,
    propertiesPending: 156,
    averageProcessingTime: 3.5,
    completionRate: 91.6,
  },
  propertiesByType: {
    RESIDENTIAL: 1245,
    COMMERCIAL: 312,
    INDUSTRIAL: 89,
    RURAL: 156,
    MIXED: 34,
    VACANT: 11,
  },
  propertiesByDistrict: {
    'Centro': 523,
    'Jardim Esperança': 312,
    'Vila Nova': 289,
    'Distrito Industrial': 156,
    'Outros': 567,
  },
  recentActivities: [
    {
      id: '1',
      type: 'property_created',
      description: 'Novo imóvel IM-2025-234 cadastrado',
      user: 'João Silva',
      timestamp: '2025-12-24T10:30:00Z',
    },
    {
      id: '2',
      type: 'property_updated',
      description: 'Imóvel IM-2025-112 atualizado',
      user: 'Maria Santos',
      timestamp: '2025-12-24T09:15:00Z',
    },
  ],
};

export function setupApiMock(api: AxiosInstance) {
  let mockEnabled = true;

  // Interceptor para simular respostas
  api.interceptors.request.use(
    async (config) => {
      if (!mockEnabled) return config;

      const { method, url } = config;

      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Login
      if (method === 'post' && url?.includes('/auth/login')) {
        const { email, password } = JSON.parse(config.data || '{}');
        
        if (email === 'admin@salesopolis.sp.gov.br' && password === 'Admin@123') {
          return Promise.reject({
            config,
            response: {
              data: {
                accessToken: 'mock-jwt-token-' + Date.now(),
                refreshToken: 'mock-refresh-token-' + Date.now(),
                user: mockUser,
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config,
            },
            isAxiosError: true,
            toJSON: () => ({}),
            name: 'MockResponse',
            message: 'Mock successful response',
          });
        } else {
          return Promise.reject({
            config,
            response: {
              data: { message: 'Credenciais inválidas' },
              status: 401,
              statusText: 'Unauthorized',
              headers: {},
              config,
            },
            isAxiosError: true,
            toJSON: () => ({}),
            name: 'MockError',
            message: 'Invalid credentials',
          });
        }
      }

      // Get current user
      if (method === 'get' && url?.includes('/auth/me')) {
        return Promise.reject({
          config,
          response: {
            data: mockUser,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Refresh token
      if (method === 'post' && url?.includes('/auth/refresh')) {
        return Promise.reject({
          config,
          response: {
            data: {
              accessToken: 'mock-jwt-token-refreshed-' + Date.now(),
              refreshToken: 'mock-refresh-token-refreshed-' + Date.now(),
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Logout
      if (method === 'post' && url?.includes('/auth/logout')) {
        return Promise.reject({
          config,
          response: {
            data: { message: 'Logout realizado com sucesso' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Get properties
      if (method === 'get' && url?.includes('/cadastro/properties')) {
        const page = parseInt(config.params?.page || '1');
        const pageSize = parseInt(config.params?.pageSize || '20');
        
        return Promise.reject({
          config,
          response: {
            data: {
              data: mockProperties,
              meta: {
                total: mockProperties.length,
                page,
                pageSize,
                totalPages: Math.ceil(mockProperties.length / pageSize),
              },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Get property by ID
      if (method === 'get' && url?.match(/\/cadastro\/properties\/[\w-]+$/)) {
        const property = mockProperties[0];
        return Promise.reject({
          config,
          response: {
            data: property,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Dashboard data
      if (method === 'get' && url?.includes('/dashboard')) {
        return Promise.reject({
          config,
          response: {
            data: mockDashboardData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          },
          isAxiosError: true,
          toJSON: () => ({}),
          name: 'MockResponse',
          message: 'Mock successful response',
        });
      }

      // Se não encontrou mock, deixa passar (vai tentar backend real)
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de resposta para tratar mocks
  api.interceptors.response.use(
    undefined,
    (error) => {
      if (error.name === 'MockResponse') {
        return Promise.resolve(error.response);
      }
      if (error.name === 'MockError') {
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );

  return {
    enable: () => { mockEnabled = true; },
    disable: () => { mockEnabled = false; },
  };
}
