// Este arquivo foi substituído por lib/supabase.ts
// Mantido apenas para compatibilidade de imports

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresMfa?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  mfaEnabled: boolean;
}

export interface EnableMfaResponse {
  secret: string;
  qrCode: string;
}

// Redireciona para o novo serviço
export const authService = {
  async login(): Promise<AuthResponse> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async logout(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async refreshToken(): Promise<AuthResponse> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async getCurrentUser(): Promise<User> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async updateProfile(): Promise<User> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async changePassword(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async enableMfa(): Promise<EnableMfaResponse> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async verifyMfa(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async disableMfa(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async requestPasswordReset(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
  async resetPassword(): Promise<void> {
    throw new Error('Use authService de lib/supabase.ts');
  },
};
