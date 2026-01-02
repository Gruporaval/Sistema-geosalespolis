-- ============================================
-- SCHEMA COMPLETO - SISTEMA GEOSALESPOLIS
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABELAS DE AUTENTICAÇÃO E USUÁRIOS
-- ============================================

-- Tabela de Perfis/Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE CADASTRO IMOBILIÁRIO
-- ============================================

-- Tabela de Imóveis
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    digital_code VARCHAR(50) UNIQUE NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Salesópolis',
    state VARCHAR(2) DEFAULT 'SP',
    zip_code VARCHAR(10),
    coordinates GEOMETRY(POINT, 4326),
    area_total DECIMAL(10, 2),
    area_built DECIMAL(10, 2),
    property_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    owner_name VARCHAR(255),
    owner_document VARCHAR(20),
    owner_phone VARCHAR(20),
    owner_email VARCHAR(255),
    tax_id VARCHAR(50),
    registration_number VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice espacial para consultas geográficas
CREATE INDEX IF NOT EXISTS idx_properties_coordinates ON properties USING GIST(coordinates);

-- Tabela de Endereços (para endereçamento)
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    digital_code VARCHAR(50) UNIQUE NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Salesópolis',
    state VARCHAR(2) DEFAULT 'SP',
    zip_code VARCHAR(10) NOT NULL,
    coordinates GEOMETRY(POINT, 4326),
    status VARCHAR(50) DEFAULT 'active',
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_coordinates ON addresses USING GIST(coordinates);

-- ============================================
-- TABELAS DE PRIVACIDADE E DADOS PÚBLICOS
-- ============================================

-- Tabela de Configurações de Privacidade
CREATE TABLE IF NOT EXISTS privacy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'property', 'address', etc
    entity_id UUID NOT NULL,
    is_public BOOLEAN DEFAULT false,
    public_fields JSONB DEFAULT '[]',
    access_level VARCHAR(50) DEFAULT 'private',
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Dados Públicos (log de publicações)
CREATE TABLE IF NOT EXISTS public_data_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'published', 'unpublished', 'updated'
    changed_fields JSONB,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE SUPORTE
-- ============================================

-- Tabela de Tickets de Suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Comentários de Tickets
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE AUDITORIA
-- ============================================

-- Tabela de Auditoria
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELAS DE INTEGRAÇÕES
-- ============================================

-- Tabela de Configurações de Integrações
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'api', 'webhook', 'database', etc
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ticket_number := 'TKT-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence para números de ticket
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Trigger para gerar número de ticket
CREATE TRIGGER generate_ticket_number_trigger BEFORE INSERT ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir Roles padrão
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador do Sistema', '{"all": true}'),
('manager', 'Gerente', '{"read": true, "write": true, "delete": false}'),
('user', 'Usuário Padrão', '{"read": true, "write": false, "delete": false}'),
('viewer', 'Visualizador', '{"read": true, "write": false, "delete": false}')
ON CONFLICT (name) DO NOTHING;

-- Inserir usuário admin padrão
-- Senha: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, name, role_id, is_active) 
SELECT 
    'admin@salesopolis.sp.gov.br',
    '$2a$10$rOzJQjKqVZ8YKZ9YvZ8YKOzJQjKqVZ8YKZ9YvZ8YKOzJQjKqVZ8YK', -- admin123
    'Administrador',
    (SELECT id FROM roles WHERE name = 'admin'),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@salesopolis.sp.gov.br'
);

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (exemplo - ajustar conforme necessário)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_properties_digital_code ON properties(digital_code);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_addresses_zip_code ON addresses(zip_code);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de usuários com informações de role
CREATE OR REPLACE VIEW users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.is_active,
    u.last_login,
    u.created_at,
    r.name as role_name,
    r.description as role_description
FROM users u
LEFT JOIN roles r ON u.role_id = r.id;

-- View de propriedades com localização
CREATE OR REPLACE VIEW properties_with_location AS
SELECT 
    p.*,
    ST_X(p.coordinates::geometry) as longitude,
    ST_Y(p.coordinates::geometry) as latitude
FROM properties p;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE properties IS 'Tabela de cadastro de imóveis';
COMMENT ON TABLE addresses IS 'Tabela de endereçamento';
COMMENT ON TABLE support_tickets IS 'Tabela de tickets de suporte';
COMMENT ON TABLE audit_log IS 'Tabela de auditoria de ações do sistema';
