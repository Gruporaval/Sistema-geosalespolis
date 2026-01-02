import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const SUPABASE_URL = 'https://zjbghhcsemymbdqnhcdu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmdoaGNzZW15bWJkcW5oY2R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjUyOTYsImV4cCI6MjA4MjE0MTI5Nn0._K8hQ6QTi32eGxP4IiC9nA5dSgzZeK7uIGWq-yTLg7Q';

// Criar cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

// Tipos do banco de dados
export interface User {
    id: string;
    email: string;
    name: string;
    role_id: string;
    avatar_url?: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: any;
    created_at: string;
    updated_at: string;
}

export interface Property {
    id: string;
    digital_code: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code?: string;
    coordinates?: any;
    area_total?: number;
    area_built?: number;
    property_type?: string;
    status: string;
    owner_name?: string;
    owner_document?: string;
    owner_phone?: string;
    owner_email?: string;
    tax_id?: string;
    registration_number?: string;
    notes?: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface Address {
    id: string;
    digital_code: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
    coordinates?: any;
    status: string;
    verified: boolean;
    verified_at?: string;
    verified_by?: string;
    created_by?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

export interface SupportTicket {
    id: string;
    ticket_number: string;
    title: string;
    description: string;
    category?: string;
    priority: string;
    status: string;
    created_by?: string;
    assigned_to?: string;
    resolved_at?: string;
    closed_at?: string;
    created_at: string;
    updated_at: string;
}

// Funções de autenticação
export const authService = {
    // Login (Mock - não depende do banco)
    async login(email: string, password: string) {
        try {
            // Validar credenciais (mock)
            if (email === 'admin@salesopolis.sp.gov.br' && password === 'admin123') {
                const mockUser = {
                    id: '1',
                    email: 'admin@salesopolis.sp.gov.br',
                    name: 'Administrador',
                    role: {
                        id: 'admin-role',
                        name: 'admin',
                        description: 'Administrador do Sistema',
                        permissions: { all: true },
                    },
                };

                // Criar sessão local
                const session = {
                    user: mockUser,
                    accessToken: `token-${Date.now()}`,
                    refreshToken: `refresh-${Date.now()}`,
                };

                // Salvar no localStorage
                localStorage.setItem('session', JSON.stringify(session));
                localStorage.setItem('accessToken', session.accessToken);

                return session;
            } else {
                throw new Error('Email ou senha incorretos');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Erro ao fazer login');
        }
    },

    // Logout
    async logout() {
        localStorage.removeItem('session');
        localStorage.removeItem('accessToken');
    },

    // Verificar sessão
    async getSession() {
        const sessionStr = localStorage.getItem('session');
        if (!sessionStr) return null;

        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    },

    // Obter usuário atual
    async getCurrentUser() {
        const session = await this.getSession();
        if (!session) return null;

        try {
            const { data: user, error } = await supabase
                .from('users')
                .select(`
          *,
          role:roles(*)
        `)
                .eq('id', session.user.id)
                .single();

            if (error) throw error;
            return user;
        } catch {
            return null;
        }
    },
};

// Funções de CRUD para Properties
export const propertiesService = {
    async getAll() {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(property: Partial<Property>) {
        const { data, error } = await supabase
            .from('properties')
            .insert(property)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, property: Partial<Property>) {
        const { data, error } = await supabase
            .from('properties')
            .update(property)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// Funções de CRUD para Addresses
export const addressesService = {
    async getAll() {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(address: Partial<Address>) {
        const { data, error } = await supabase
            .from('addresses')
            .insert(address)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, address: Partial<Address>) {
        const { data, error } = await supabase
            .from('addresses')
            .update(address)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// Funções de CRUD para Support Tickets
export const ticketsService = {
    async getAll() {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
        *,
        comments:ticket_comments(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(ticket: Partial<SupportTicket>) {
        const { data, error } = await supabase
            .from('support_tickets')
            .insert(ticket)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, ticket: Partial<SupportTicket>) {
        const { data, error } = await supabase
            .from('support_tickets')
            .update(ticket)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};

export default supabase;
