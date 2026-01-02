# 🚀 GUIA RÁPIDO - Configurar Banco de Dados

## ⚡ Execute AGORA no Supabase

1. Acesse: https://zjbghhcsemymbdqnhcdu.supabase.co
2. Vá em **SQL Editor** (menu lateral esquerdo)
3. Clique em **New Query**
4. Cole o código abaixo e clique em **RUN**

```sql
-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

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

-- Inserir Roles padrão
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador do Sistema', '{"all": true}'),
('manager', 'Gerente', '{"read": true, "write": true, "delete": false}'),
('user', 'Usuário Padrão', '{"read": true, "write": false, "delete": false}')
ON CONFLICT (name) DO NOTHING;

-- Inserir usuário admin
INSERT INTO users (email, password_hash, name, role_id, is_active) 
SELECT 
    'admin@salesopolis.sp.gov.br',
    'admin123',
    'Administrador',
    (SELECT id FROM roles WHERE name = 'admin'),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@salesopolis.sp.gov.br'
);

-- Inserir dados de exemplo
INSERT INTO properties (digital_code, street, number, neighborhood, property_type, status) VALUES
('001-2024', 'Rua das Flores', '123', 'Centro', 'Residencial', 'active'),
('002-2024', 'Avenida Principal', '456', 'Centro', 'Comercial', 'active'),
('003-2024', 'Rua do Comércio', '789', 'Zona Norte', 'Comercial', 'active'),
('004-2024', 'Rua das Palmeiras', '321', 'Zona Sul', 'Residencial', 'active'),
('005-2024', 'Avenida Industrial', '654', 'Zona Leste', 'Industrial', 'active')
ON CONFLICT (digital_code) DO NOTHING;

-- Tabela de Camadas GIS
CREATE TABLE IF NOT EXISTS gis_layers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'vector' ou 'raster'
    visibility VARCHAR(50) DEFAULT 'publica', -- 'publica' ou 'interna'
    is_active BOOLEAN DEFAULT false,
    style JSONB DEFAULT '{}',
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir camadas GIS padrão
INSERT INTO gis_layers (name, type, visibility, is_active, style, description) VALUES
('Imóveis Urbanos', 'vector', 'interna', true, 
 '{"color": "#3b82f6", "fillColor": "#3b82f6", "weight": 2, "opacity": 0.8, "fillOpacity": 0.2}',
 'Camada de imóveis urbanos cadastrados'),
('PGV - Planta Genérica de Valores', 'vector', 'interna', false,
 '{"color": "#10b981", "fillColor": "#10b981", "weight": 1, "opacity": 0.6, "fillOpacity": 0.1}',
 'Planta Genérica de Valores para cálculo de IPTU'),
('Loteamentos', 'vector', 'publica', false,
 '{"color": "#f59e0b", "fillColor": "#f59e0b", "weight": 1, "opacity": 0.5, "fillOpacity": 0.05}',
 'Loteamentos aprovados no município'),
('Zoneamento Urbano', 'vector', 'publica', false,
 '{"color": "#8b5cf6", "fillColor": "#8b5cf6", "weight": 1, "opacity": 0.6, "fillOpacity": 0.15}',
 'Zoneamento urbano conforme plano diretor'),
('Áreas de Preservação', 'vector', 'publica', false,
 '{"color": "#22c55e", "fillColor": "#22c55e", "weight": 2, "opacity": 0.7, "fillOpacity": 0.25}',
 'Áreas de preservação ambiental')
ON CONFLICT DO NOTHING;

-- Desabilitar RLS para permitir inserções (ajuste conforme necessidade de segurança)
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE gis_layers DISABLE ROW LEVEL SECURITY;
```

## ✅ Depois de executar, volte aqui!
