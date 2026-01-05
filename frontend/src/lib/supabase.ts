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

export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    entity_type?: string;
    entity_id?: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
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

// Funções de CRUD para Usuários
export const usersService = {
    /**
     * Buscar todos os usuários com suas roles
     */
    async getAll() {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Buscar usuário por ID com informações de role
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Buscar usuário por email
     */
    async getByEmail(email: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .eq('email', email)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Criar novo usuário
     */
    async create(userData: {
        email: string;
        password: string;
        name: string;
        role_id: string;
        avatar_url?: string;
        is_active?: boolean;
    }) {
        // Verificar se email já existe
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();

        if (existingUser) {
            throw new Error('Email já cadastrado no sistema');
        }

        // Hash da senha (em produção, isso deve ser feito no backend)
        // Por enquanto, vamos usar um hash simples (substitua por bcrypt no backend)
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(userData.password, 10);

        const newUser = {
            email: userData.email,
            password_hash,
            name: userData.name,
            role_id: userData.role_id,
            avatar_url: userData.avatar_url,
            is_active: userData.is_active !== undefined ? userData.is_active : true,
        };

        const { data, error } = await supabase
            .from('users')
            .insert(newUser)
            .select(`
                *,
                role:roles(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar usuário
     */
    async update(id: string, userData: Partial<{
        email: string;
        name: string;
        role_id: string;
        avatar_url: string;
        is_active: boolean;
    }>) {
        // Se estiver atualizando o email, verificar se já existe
        if (userData.email) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', userData.email)
                .neq('id', id)
                .single();

            if (existingUser) {
                throw new Error('Email já está em uso por outro usuário');
            }
        }

        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('id', id)
            .select(`
                *,
                role:roles(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar senha do usuário
     */
    async updatePassword(id: string, newPassword: string) {
        // Hash da senha (em produção, isso deve ser feito no backend)
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(newPassword, 10);

        const { data, error } = await supabase
            .from('users')
            .update({ password_hash })
            .eq('id', id)
            .select(`
                *,
                role:roles(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Excluir usuário
     */
    async delete(id: string) {
        // Verificar se não é o único admin
        const { data: user } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .eq('id', id)
            .single();

        if (user?.role?.name === 'admin') {
            // Contar quantos admins existem
            const { count } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('role_id', user.role_id);

            if (count !== null && count <= 1) {
                throw new Error('Não é possível excluir o último administrador do sistema');
            }
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Ativar/Desativar usuário
     */
    async toggleActive(id: string, isActive: boolean) {
        const { data, error } = await supabase
            .from('users')
            .update({ is_active: isActive })
            .eq('id', id)
            .select(`
                *,
                role:roles(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar último login
     */
    async updateLastLogin(id: string) {
        const { data, error } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Buscar usuários por role
     */
    async getByRole(roleName: string) {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .eq('role.name', roleName)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Buscar usuários ativos
     */
    async getActive() {
        const { data, error } = await supabase
            .from('users')
            .select(`
                *,
                role:roles(*)
            `)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },
};

// Funções de CRUD para Roles
export const rolesService = {
    /**
     * Buscar todas as roles
     */
    async getAll() {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Buscar role por ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Buscar role por nome
     */
    async getByName(name: string) {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .eq('name', name)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Criar nova role
     */
    async create(roleData: {
        name: string;
        description?: string;
        permissions?: any;
    }) {
        const { data, error } = await supabase
            .from('roles')
            .insert(roleData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Atualizar role
     */
    async update(id: string, roleData: Partial<{
        name: string;
        description: string;
        permissions: any;
    }>) {
        const { data, error } = await supabase
            .from('roles')
            .update(roleData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Excluir role
     */
    async delete(id: string) {
        // Verificar se há usuários usando esta role
        const { data: users } = await supabase
            .from('users')
            .select('id')
            .eq('role_id', id)
            .limit(1);

        if (users && users.length > 0) {
            throw new Error('Não é possível excluir esta role pois existem usuários vinculados a ela');
        }

        const { error } = await supabase
            .from('roles')
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

// Funções de CRUD para Auditoria
export const auditService = {
    /**
     * Buscar todos os logs de auditoria com informações de usuário
     */
    async getAll(options?: {
        limit?: number;
        offset?: number;
        action?: string;
        entity_type?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
    }) {
        let query = supabase
            .from('audit_log')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .order('created_at', { ascending: false });

        // Aplicar filtros
        if (options?.action) {
            query = query.ilike('action', `%${options.action}%`);
        }
        if (options?.entity_type) {
            query = query.eq('entity_type', options.entity_type);
        }
        if (options?.user_id) {
            query = query.eq('user_id', options.user_id);
        }
        if (options?.date_from) {
            query = query.gte('created_at', options.date_from);
        }
        if (options?.date_to) {
            query = query.lte('created_at', options.date_to);
        }

        // Aplicar paginação
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        if (options?.offset) {
            query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    },

    /**
     * Buscar log específico por ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('audit_log')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Criar novo log de auditoria
     */
    async create(logData: {
        user_id?: string;
        action: string;
        entity_type?: string;
        entity_id?: string;
        old_values?: any;
        new_values?: any;
        ip_address?: string;
        user_agent?: string;
    }) {
        const { data, error } = await supabase
            .from('audit_log')
            .insert(logData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Buscar logs por tipo de entidade
     */
    async getByEntityType(entityType: string) {
        const { data, error } = await supabase
            .from('audit_log')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .eq('entity_type', entityType)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Buscar logs por usuário
     */
    async getByUser(userId: string) {
        const { data, error } = await supabase
            .from('audit_log')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Buscar logs por ação
     */
    async getByAction(action: string) {
        const { data, error } = await supabase
            .from('audit_log')
            .select(`
                *,
                user:users(id, name, email)
            `)
            .ilike('action', `%${action}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Contar total de logs
     */
    async count(options?: {
        action?: string;
        entity_type?: string;
        user_id?: string;
    }) {
        let query = supabase
            .from('audit_log')
            .select('*', { count: 'exact', head: true });

        if (options?.action) {
            query = query.ilike('action', `%${options.action}%`);
        }
        if (options?.entity_type) {
            query = query.eq('entity_type', options.entity_type);
        }
        if (options?.user_id) {
            query = query.eq('user_id', options.user_id);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count || 0;
    },

    /**
     * Buscar estatísticas de auditoria
     */
    async getStats() {
        const { data, error } = await supabase
            .from('audit_log')
            .select('action, entity_type, created_at');

        if (error) throw error;

        // Calcular estatísticas
        const stats = {
            total: data?.length || 0,
            byAction: {} as Record<string, number>,
            byEntityType: {} as Record<string, number>,
            last24h: 0,
            lastWeek: 0,
        };

        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        data?.forEach(log => {
            // Contar por ação
            stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;

            // Contar por tipo de entidade
            if (log.entity_type) {
                stats.byEntityType[log.entity_type] = (stats.byEntityType[log.entity_type] || 0) + 1;
            }

            // Contar logs recentes
            const logDate = new Date(log.created_at);
            if (logDate >= last24h) stats.last24h++;
            if (logDate >= lastWeek) stats.lastWeek++;
        });

        return stats;
    },

    /**
     * Helper para registrar ação (uso interno)
     */
    async log(
        action: string,
        options?: {
            entity_type?: string;
            entity_id?: string;
            old_values?: any;
            new_values?: any;
        }
    ) {
        try {
            // Pegar usuário atual da sessão
            const session = await authService.getSession();
            const user_id = session?.user?.id;

            // Pegar IP e User Agent (se disponível no browser)
            const ip_address = ''; // Em produção, pegar do backend
            const user_agent = navigator?.userAgent || '';

            await this.create({
                user_id,
                action,
                entity_type: options?.entity_type,
                entity_id: options?.entity_id,
                old_values: options?.old_values,
                new_values: options?.new_values,
                ip_address,
                user_agent,
            });
        } catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
            // Não lançar erro para não interromper a operação principal
        }
    },
};

export default supabase;
