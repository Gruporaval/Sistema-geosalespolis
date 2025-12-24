# Modelagem de Dados - Sistema de Cadastro Salesópolis

## 📊 Diagrama Entidade-Relacionamento (ERD)

```
┌─────────────────┐         ┌─────────────────┐
│     users       │         │      roles      │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │    ┌────│ name            │
│ password_hash   │    │    │ description     │
│ name            │    │    └─────────────────┘
│ cpf             │    │
│ phone           │    │    ┌─────────────────┐
│ role_id (FK)────┼────┘    │  permissions    │
│ is_active       │         ├─────────────────┤
│ mfa_enabled     │         │ id (PK)         │
│ mfa_secret      │         │ resource        │
│ created_at      │         │ action          │
│ updated_at      │         │ description     │
│ last_login_at   │         └─────────────────┘
└─────────────────┘                  △
         │                           │
         │                           │ role_permissions (many-to-many)
         │                           │
         │                           ▽
         │                  ┌─────────────────┐
         │                  │ role_permissions│
         │                  ├─────────────────┤
         │                  │ role_id (FK)    │
         │                  │ permission_id(FK)│
         │                  └─────────────────┘
         │
         │
         ▽
┌─────────────────────────────────────────────────────────┐
│                    properties                           │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ codigo_imovel (UNIQUE)  -- Identificador municipal      │
│ tipo_imovel              -- 'RESIDENCIAL', 'COMERCIAL', etc.
│ area_terreno                                            │
│ area_construida                                         │
│ proprietario_nome                                       │
│ proprietario_cpf_cnpj                                   │
│ proprietario_telefone                                   │
│ proprietario_email                                      │
│ uso_predominante         -- 'RESIDENCIAL', 'COMERCIAL', etc.
│ situacao                 -- 'ATIVO', 'INATIVO', 'EM_RECADASTRAMENTO'
│ inscricao_municipal                                     │
│ inscricao_estadual                                      │
│ matricula_registro                                      │
│ observacoes                                             │
│ digital_address_id (FK) --> digital_addresses           │
│ geometry_id (FK)        --> gis_features                │
│ created_by (FK)         --> users                       │
│ updated_by (FK)         --> users                       │
│ created_at                                              │
│ updated_at                                              │
│ deleted_at              -- Soft delete                  │
└─────────────────────────────────────────────────────────┘
         │                            │
         │                            │
         │                            ▽
         │                   ┌─────────────────┐
         │                   │ gis_features    │
         │                   ├─────────────────┤
         │                   │ id (PK)         │
         │                   │ layer_id (FK)   │
         │                   │ geometry (PostGIS)
         │                   │ properties (JSONB)
         │                   │ created_by (FK) │
         │                   │ created_at      │
         │                   │ updated_at      │
         │                   └─────────────────┘
         │                            △
         │                            │
         │                            │
         │                   ┌─────────────────┐
         │                   │   gis_layers    │
         │                   ├─────────────────┤
         │                   │ id (PK)         │
         │                   │ name            │
         │                   │ slug            │
         │                   │ description     │
         │                   │ geometry_type   │
         │                   │ srid            │
         │                   │ style (JSONB)   │
         │                   │ is_visible      │
         │                   │ display_order   │
         │                   │ permissions(JSONB)
         │                   │ created_at      │
         │                   └─────────────────┘
         │
         │
         ▽
┌─────────────────────────────────────────────────────────┐
│              property_history                           │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ property_id (FK)        --> properties                  │
│ changed_by (FK)         --> users                       │
│ changed_at                                              │
│ change_type             -- 'CREATE', 'UPDATE', 'DELETE' │
│ old_values (JSONB)      -- Estado anterior              │
│ new_values (JSONB)      -- Estado novo                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              property_attachments                       │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ property_id (FK)        --> properties                  │
│ file_name                                               │
│ file_type               -- 'DOCUMENT', 'PHOTO', 'OTHER' │
│ file_size                                               │
│ storage_path            -- S3 path                      │
│ uploaded_by (FK)        --> users                       │
│ uploaded_at                                             │
│ description                                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              digital_addresses                          │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ codigo (UNIQUE)         -- SAL-2025-00001               │
│ logradouro                                              │
│ numero                                                  │
│ complemento                                             │
│ bairro                                                  │
│ cep                                                     │
│ municipio               -- 'Salesópolis'                │
│ uf                      -- 'SP'                         │
│ latitude                                                │
│ longitude                                               │
│ geocoding_source        -- 'INTERNAL', 'NOMINATIM', etc.│
│ geocoding_confidence                                    │
│ validated               -- TRUE/FALSE                   │
│ validated_at                                            │
│ validated_by (FK)       --> users                       │
│ created_at                                              │
│ updated_at                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    audit_log                            │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ user_id (FK)            --> users                       │
│ action                  -- 'CREATE', 'UPDATE', etc.     │
│ entity_type             -- 'property', 'user', etc.     │
│ entity_id                                               │
│ changes (JSONB)         -- Before/After                 │
│ ip_address                                              │
│ user_agent                                              │
│ timestamp                                               │
│ hash                    -- SHA-256 for immutability     │
│ previous_hash           -- Chain                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           lgpd_data_treatment_log                       │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ data_subject_type       -- 'PROPRIETARIO', 'USUARIO'    │
│ data_subject_id                                         │
│ processing_type         -- 'COLETA', 'CONSULTA', etc.   │
│ purpose                 -- Finalidade                   │
│ legal_basis             -- 'LGPD Art. 7, I' etc.        │
│ data_categories (JSONB) -- ['nome', 'cpf', 'endereco']  │
│ processed_by (FK)       --> users                       │
│ processed_at                                            │
│ retention_period        -- Prazo de retenção            │
│ notes                                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              integration_logs                           │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ integration_type        -- 'IMPORT', 'EXPORT', 'API_SYNC'
│ source_system                                           │
│ file_name                                               │
│ file_path               -- S3 path                      │
│ status                  -- 'SUCCESS', 'PARTIAL', 'FAILED'
│ records_total                                           │
│ records_success                                         │
│ records_failed                                          │
│ error_details (JSONB)   -- Lista de erros               │
│ mapping_id (FK)         --> integration_mappings        │
│ started_by (FK)         --> users                       │
│ started_at                                              │
│ completed_at                                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           integration_mappings                          │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ name                    -- Nome do mapeamento           │
│ description                                             │
│ source_system                                           │
│ entity_type             -- 'property', 'address', etc.  │
│ field_mappings (JSONB)  -- { "source_field": "target_field" }
│ transformations (JSONB) -- Regras de transformação      │
│ is_active                                               │
│ created_by (FK)         --> users                       │
│ created_at                                              │
│ updated_at                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              privacy_budget                             │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ dataset_name            -- 'properties', 'addresses'    │
│ epsilon_total           -- Orçamento total (ex: 1.0)    │
│ epsilon_consumed        -- Já consumido                 │
│ delta                   -- Probabilidade de falha       │
│ reset_period            -- 'DAILY', 'WEEKLY', 'MONTHLY' │
│ last_reset_at                                           │
│ next_reset_at                                           │
│ created_at                                              │
│ updated_at                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│             public_queries_log                          │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ dataset_name                                            │
│ query_type              -- 'COUNT', 'SUM', 'MEAN', etc. │
│ query_params (JSONB)    -- Filtros aplicados            │
│ epsilon_consumed        -- Epsilon desta query          │
│ true_result             -- Resultado real (não exposto) │
│ noisy_result            -- Resultado com ruído          │
│ ip_address                                              │
│ user_agent                                              │
│ timestamp                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              support_tickets                            │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ ticket_number (UNIQUE)  -- Auto-incrementado            │
│ requester_id (FK)       --> users                       │
│ subject                                                 │
│ description                                             │
│ priority                -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
│ category                -- 'TECHNICAL', 'DATA', etc.    │
│ status                  -- 'OPEN', 'IN_PROGRESS', etc.  │
│ assigned_to (FK)        --> users                       │
│ sla_deadline                                            │
│ created_at                                              │
│ updated_at                                              │
│ resolved_at                                             │
│ closed_at                                               │
└─────────────────────────────────────────────────────────┘
         │
         │
         ▽
┌─────────────────────────────────────────────────────────┐
│           support_ticket_messages                       │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ ticket_id (FK)          --> support_tickets             │
│ sender_id (FK)          --> users                       │
│ message                                                 │
│ is_internal             -- Visível apenas para equipe   │
│ created_at                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                auth_log                                 │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                 │
│ user_id (FK)            --> users                       │
│ event_type              -- 'LOGIN', 'LOGOUT', 'MFA_ENABLED'
│ ip_address                                              │
│ user_agent                                              │
│ success                 -- TRUE/FALSE                   │
│ failure_reason                                          │
│ timestamp                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📜 DDL (Data Definition Language) - PostgreSQL + PostGIS

### 1. Extensions

```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto full-text
```

---

### 2. Enum Types

```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'OPERATOR', 'AUDITOR', 'PUBLIC');
CREATE TYPE property_type AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'RURAL', 'MISTO', 'OUTRO');
CREATE TYPE property_use AS ENUM ('RESIDENCIAL', 'COMERCIAL', 'INDUSTRIAL', 'PUBLICO', 'RELIGIOSO', 'OUTRO');
CREATE TYPE property_status AS ENUM ('ATIVO', 'INATIVO', 'EM_RECADASTRAMENTO', 'PENDENTE_VALIDACAO');
CREATE TYPE attachment_type AS ENUM ('DOCUMENT', 'PHOTO', 'OTHER');
CREATE TYPE integration_type AS ENUM ('IMPORT', 'EXPORT', 'API_SYNC');
CREATE TYPE integration_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL', 'FAILED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED');
CREATE TYPE ticket_category AS ENUM ('TECHNICAL', 'DATA', 'ACCESS', 'TRAINING', 'OTHER');
CREATE TYPE change_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT');
CREATE TYPE geocoding_source AS ENUM ('INTERNAL', 'NOMINATIM', 'GOOGLE', 'MANUAL');
CREATE TYPE reset_period AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE geometry_type_enum AS ENUM ('POINT', 'LINESTRING', 'POLYGON', 'MULTIPOINT', 'MULTILINESTRING', 'MULTIPOLYGON');
```

---

### 3. Tables

#### 3.1. Users & Authentication

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL, -- 'gis', 'cadastro', 'integracao', etc.
    action VARCHAR(50) NOT NULL,    -- 'read', 'write', 'delete', 'export'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    phone VARCHAR(20),
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255), -- Base32 encoded secret for TOTP
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_role ON users(role_id);

CREATE TABLE auth_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'LOGIN', 'LOGOUT', 'MFA_ENABLED', 'PASSWORD_CHANGE'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_log_user ON auth_log(user_id, timestamp DESC);
```

---

#### 3.2. GIS Layers & Features

```sql
CREATE TABLE gis_layers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    geometry_type geometry_type_enum NOT NULL,
    srid INTEGER DEFAULT 4674, -- SIRGAS 2000
    style JSONB, -- Estilo visual (cor, ícone, etc.) para renderização
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    permissions JSONB, -- { "read": ["ADMIN", "OPERATOR"], "write": ["ADMIN"] }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gis_layers_slug ON gis_layers(slug);

CREATE TABLE gis_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_id UUID REFERENCES gis_layers(id) ON DELETE CASCADE,
    geometry GEOMETRY(Geometry, 4674) NOT NULL, -- Suporta POINT, LINESTRING, POLYGON, etc.
    properties JSONB, -- Atributos adicionais (ex: nome, código, etc.)
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Índices espaciais
CREATE INDEX idx_gis_features_geometry ON gis_features USING GIST(geometry);
CREATE INDEX idx_gis_features_layer ON gis_features(layer_id);
CREATE INDEX idx_gis_features_props ON gis_features USING GIN(properties);
```

---

#### 3.3. Digital Addresses

```sql
CREATE TABLE digital_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL, -- SAL-2025-00001
    logradouro VARCHAR(255) NOT NULL,
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cep VARCHAR(10),
    municipio VARCHAR(100) DEFAULT 'Salesópolis',
    uf VARCHAR(2) DEFAULT 'SP',
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    geocoding_source geocoding_source DEFAULT 'INTERNAL',
    geocoding_confidence NUMERIC(3, 2), -- 0.00 a 1.00
    validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_digital_addresses_codigo ON digital_addresses(codigo);
CREATE INDEX idx_digital_addresses_cep ON digital_addresses(cep);
CREATE INDEX idx_digital_addresses_coords ON digital_addresses(latitude, longitude);
-- Índice para busca textual
CREATE INDEX idx_digital_addresses_logradouro_trgm ON digital_addresses USING GIN(logradouro gin_trgm_ops);
```

---

#### 3.4. Properties (Cadastro Imobiliário)

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_imovel VARCHAR(50) UNIQUE NOT NULL,
    tipo_imovel property_type,
    area_terreno NUMERIC(12, 2), -- em m²
    area_construida NUMERIC(12, 2), -- em m²
    proprietario_nome VARCHAR(255),
    proprietario_cpf_cnpj VARCHAR(18),
    proprietario_telefone VARCHAR(20),
    proprietario_email VARCHAR(255),
    uso_predominante property_use,
    situacao property_status DEFAULT 'ATIVO',
    inscricao_municipal VARCHAR(50),
    inscricao_estadual VARCHAR(50),
    matricula_registro VARCHAR(50),
    observacoes TEXT,
    digital_address_id UUID REFERENCES digital_addresses(id),
    geometry_id UUID REFERENCES gis_features(id),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

CREATE INDEX idx_properties_codigo ON properties(codigo_imovel);
CREATE INDEX idx_properties_cpf_cnpj ON properties(proprietario_cpf_cnpj);
CREATE INDEX idx_properties_situacao ON properties(situacao);
CREATE INDEX idx_properties_address ON properties(digital_address_id);
CREATE INDEX idx_properties_geometry ON properties(geometry_id);
-- Busca textual
CREATE INDEX idx_properties_nome_trgm ON properties USING GIN(proprietario_nome gin_trgm_ops);
```

---

#### 3.5. Property History

```sql
CREATE TABLE property_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    change_type change_type NOT NULL,
    old_values JSONB,
    new_values JSONB
);

CREATE INDEX idx_property_history_property ON property_history(property_id, changed_at DESC);
```

**Trigger para popular automaticamente**:

```sql
CREATE OR REPLACE FUNCTION log_property_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO property_history (property_id, changed_by, change_type, old_values, new_values)
        VALUES (
            OLD.id,
            NEW.updated_by,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO property_history (property_id, changed_by, change_type, old_values)
        VALUES (
            OLD.id,
            CURRENT_USER::UUID, -- Idealmente, passar via application context
            'DELETE',
            row_to_json(OLD)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_property_history
AFTER UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION log_property_changes();
```

---

#### 3.6. Property Attachments

```sql
CREATE TABLE property_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type attachment_type DEFAULT 'OTHER',
    file_size BIGINT, -- em bytes
    storage_path TEXT NOT NULL, -- S3 path
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

CREATE INDEX idx_property_attachments_property ON property_attachments(property_id);
```

---

#### 3.7. Audit Log (LGPD)

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT'
    entity_type VARCHAR(100), -- 'property', 'user', 'gis_feature', etc.
    entity_id UUID,
    changes JSONB, -- { "before": {...}, "after": {...} }
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    hash VARCHAR(64), -- SHA-256
    previous_hash VARCHAR(64) -- Hash do log anterior (para cadeia imutável)
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
```

**Função para calcular hash (exemplo)**:

```sql
CREATE OR REPLACE FUNCTION calculate_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
    prev_hash VARCHAR(64);
BEGIN
    -- Buscar hash do log anterior
    SELECT hash INTO prev_hash
    FROM audit_log
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Calcular hash do log atual
    NEW.previous_hash := COALESCE(prev_hash, '');
    NEW.hash := encode(
        digest(
            NEW.id::TEXT || NEW.previous_hash || NEW.timestamp::TEXT || NEW.changes::TEXT,
            'sha256'
        ),
        'hex'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_hash
BEFORE INSERT ON audit_log
FOR EACH ROW EXECUTE FUNCTION calculate_audit_hash();
```

---

#### 3.8. LGPD Data Treatment Log

```sql
CREATE TABLE lgpd_data_treatment_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_subject_type VARCHAR(50) NOT NULL, -- 'PROPRIETARIO', 'USUARIO', 'CIDADAO'
    data_subject_id VARCHAR(100), -- CPF/CNPJ ou identificador
    processing_type VARCHAR(100) NOT NULL, -- 'COLETA', 'CONSULTA', 'ATUALIZACAO', 'EXCLUSAO', 'ANONIMIZACAO'
    purpose TEXT NOT NULL, -- Finalidade do tratamento
    legal_basis TEXT NOT NULL, -- 'LGPD Art. 7, I - Consentimento' ou 'Art. 7, II - Obrigação legal'
    data_categories JSONB, -- ["nome", "cpf", "endereco", "telefone"]
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    retention_period VARCHAR(50), -- '5 anos', 'Indefinido', etc.
    notes TEXT
);

CREATE INDEX idx_lgpd_log_subject ON lgpd_data_treatment_log(data_subject_type, data_subject_id);
CREATE INDEX idx_lgpd_log_date ON lgpd_data_treatment_log(processed_at DESC);
```

---

#### 3.9. Integration

```sql
CREATE TABLE integration_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_system VARCHAR(100),
    entity_type VARCHAR(50), -- 'property', 'address', etc.
    field_mappings JSONB NOT NULL, -- { "source_field": "target_field", ... }
    transformations JSONB, -- Regras de transformação (ex: uppercase, trim, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type integration_type NOT NULL,
    source_system VARCHAR(100),
    file_name VARCHAR(255),
    file_path TEXT, -- S3 path
    status integration_status DEFAULT 'PENDING',
    records_total INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB, -- [{ "row": 10, "error": "CPF inválido" }, ...]
    mapping_id UUID REFERENCES integration_mappings(id),
    started_by UUID REFERENCES users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_integration_logs_status ON integration_logs(status, started_at DESC);
```

---

#### 3.10. Privacy (Differential Privacy)

```sql
CREATE TABLE privacy_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name VARCHAR(100) UNIQUE NOT NULL, -- 'properties', 'addresses', etc.
    epsilon_total NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    epsilon_consumed NUMERIC(5, 2) DEFAULT 0.0,
    delta NUMERIC(10, 9) DEFAULT 0.00001, -- Probabilidade de falha
    reset_period reset_period DEFAULT 'MONTHLY',
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    next_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public_queries_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name VARCHAR(100) NOT NULL,
    query_type VARCHAR(50) NOT NULL, -- 'COUNT', 'SUM', 'MEAN', 'HISTOGRAM'
    query_params JSONB, -- Filtros aplicados
    epsilon_consumed NUMERIC(5, 2) NOT NULL,
    true_result NUMERIC, -- Resultado real (não exposto ao público)
    noisy_result NUMERIC, -- Resultado com ruído (exposto)
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_public_queries_dataset ON public_queries_log(dataset_name, timestamp DESC);
```

---

#### 3.11. Support Tickets

```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number SERIAL UNIQUE NOT NULL,
    requester_id UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    priority ticket_priority DEFAULT 'MEDIUM',
    category ticket_category DEFAULT 'OTHER',
    status ticket_status DEFAULT 'OPEN',
    assigned_to UUID REFERENCES users(id),
    sla_deadline TIMESTAMPTZ, -- Calculado com base na prioridade
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_support_tickets_requester ON support_tickets(requester_id);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Visível apenas para equipe de suporte
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_messages_ticket ON support_ticket_messages(ticket_id, created_at);
```

**Trigger para calcular SLA deadline**:

```sql
CREATE OR REPLACE FUNCTION calculate_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.priority
        WHEN 'URGENT' THEN
            NEW.sla_deadline := NEW.created_at + INTERVAL '2 hours';
        WHEN 'HIGH' THEN
            NEW.sla_deadline := NEW.created_at + INTERVAL '4 hours';
        WHEN 'MEDIUM' THEN
            NEW.sla_deadline := NEW.created_at + INTERVAL '8 hours';
        WHEN 'LOW' THEN
            NEW.sla_deadline := NEW.created_at + INTERVAL '24 hours';
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sla_deadline
BEFORE INSERT ON support_tickets
FOR EACH ROW EXECUTE FUNCTION calculate_sla_deadline();
```

---

## 🔒 Row-Level Security (RLS) - Exemplo

Para isolar dados por perfil:

```sql
-- Habilitar RLS na tabela properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Política: ADMIN vê tudo
CREATE POLICY admin_all_properties ON properties
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = current_setting('app.current_user_id')::UUID
        AND r.name = 'ADMIN'
    )
);

-- Política: OPERATOR vê apenas imóveis não deletados
CREATE POLICY operator_active_properties ON properties
FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL
    AND EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = current_setting('app.current_user_id')::UUID
        AND r.name IN ('OPERATOR', 'ADMIN')
    )
);
```

**Nota**: RLS requer configuração de `current_setting` no início de cada request (via middleware).

---

## 📊 Views Úteis

### View: Propriedades com Endereço e Geometria

```sql
CREATE OR REPLACE VIEW v_properties_full AS
SELECT
    p.id,
    p.codigo_imovel,
    p.tipo_imovel,
    p.area_terreno,
    p.area_construida,
    p.proprietario_nome,
    p.proprietario_cpf_cnpj,
    p.uso_predominante,
    p.situacao,
    p.inscricao_municipal,
    da.codigo AS endereco_codigo,
    da.logradouro,
    da.numero,
    da.bairro,
    da.cep,
    da.latitude,
    da.longitude,
    gf.geometry,
    p.created_at,
    p.updated_at
FROM properties p
LEFT JOIN digital_addresses da ON p.digital_address_id = da.id
LEFT JOIN gis_features gf ON p.geometry_id = gf.id
WHERE p.deleted_at IS NULL;
```

### View: Estatísticas de Recadastramento

```sql
CREATE OR REPLACE VIEW v_recadastro_stats AS
SELECT
    COUNT(*) AS total_properties,
    COUNT(*) FILTER (WHERE situacao = 'ATIVO') AS properties_active,
    COUNT(*) FILTER (WHERE situacao = 'EM_RECADASTRAMENTO') AS properties_in_progress,
    COUNT(*) FILTER (WHERE digital_address_id IS NOT NULL) AS properties_with_address,
    COUNT(*) FILTER (WHERE geometry_id IS NOT NULL) AS properties_with_geometry,
    ROUND(
        (COUNT(*) FILTER (WHERE digital_address_id IS NOT NULL)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
        2
    ) AS percent_with_address
FROM properties
WHERE deleted_at IS NULL;
```

---

## 🔄 Migrations (Prisma exemplo)

**prisma/schema.prisma** (parcial):

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

model User {
  id            String    @id @default(uuid()) @db.Uuid
  email         String    @unique @db.VarChar(255)
  passwordHash  String    @map("password_hash") @db.VarChar(255)
  name          String    @db.VarChar(255)
  cpf           String?   @unique @db.VarChar(14)
  phone         String?   @db.VarChar(20)
  roleId        String?   @map("role_id") @db.Uuid
  isActive      Boolean   @default(true) @map("is_active")
  mfaEnabled    Boolean   @default(false) @map("mfa_enabled")
  mfaSecret     String?   @map("mfa_secret") @db.VarChar(255)
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)
  lastLoginAt   DateTime? @map("last_login_at") @db.Timestamptz(6)

  role Role? @relation(fields: [roleId], references: [id])

  @@map("users")
}

model Role {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique @db.VarChar(50)
  description String?  @db.Text
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  users       User[]
  permissions RolePermission[]

  @@map("roles")
}

// ... outras models ...
```

---

## 🧪 Scripts de Seed (Dados Iniciais)

**seed.sql**:

```sql
-- Roles
INSERT INTO roles (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Administrador com acesso total'),
('22222222-2222-2222-2222-222222222222', 'OPERATOR', 'Operador de cadastro e GIS'),
('33333333-3333-3333-3333-333333333333', 'AUDITOR', 'Auditor - apenas leitura e auditoria'),
('44444444-4444-4444-4444-444444444444', 'PUBLIC', 'Acesso público com restrições');

-- Permissions
INSERT INTO permissions (resource, action, description) VALUES
('gis', 'read', 'Visualizar camadas e feições GIS'),
('gis', 'write', 'Criar e editar feições GIS'),
('gis', 'export', 'Exportar dados GIS'),
('cadastro', 'read', 'Consultar propriedades'),
('cadastro', 'write', 'Criar e editar propriedades'),
('cadastro', 'delete', 'Deletar propriedades'),
('integracao', 'import', 'Importar dados'),
('integracao', 'export', 'Exportar dados'),
('audit', 'read', 'Consultar logs de auditoria'),
('users', 'manage', 'Gerenciar usuários'),
('privacy', 'query', 'Consultar dados públicos com DP');

-- Role Permissions (ADMIN tem tudo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111111', id FROM permissions;

-- Role Permissions (OPERATOR)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '22222222-2222-2222-2222-222222222222', id FROM permissions
WHERE resource IN ('gis', 'cadastro', 'integracao') AND action IN ('read', 'write', 'import', 'export');

-- Role Permissions (AUDITOR)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '33333333-3333-3333-3333-333333333333', id FROM permissions
WHERE action = 'read';

-- Role Permissions (PUBLIC)
INSERT INTO role_permissions (role_id, permission_id)
SELECT '44444444-4444-4444-4444-444444444444', id FROM permissions
WHERE resource = 'privacy' AND action = 'query';

-- Usuário Admin padrão (senha: Admin@123)
INSERT INTO users (id, email, password_hash, name, cpf, role_id, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@salesopolis.sp.gov.br',
    '$2b$10$X9qZ5JtX9QnZ5JtX9QnZ5O...', -- bcrypt hash
    'Administrador Sistema',
    '12345678901',
    '11111111-1111-1111-1111-111111111111',
    TRUE
);

-- Camadas GIS iniciais
INSERT INTO gis_layers (name, slug, description, geometry_type, srid, is_visible, display_order) VALUES
('Lotes', 'lotes', 'Lotes cadastrados', 'POLYGON', 4674, TRUE, 1),
('Quadras', 'quadras', 'Quadras', 'POLYGON', 4674, TRUE, 2),
('Logradouros', 'logradouros', 'Vias e logradouros', 'LINESTRING', 4674, TRUE, 3),
('Zonas PGV', 'zonas-pgv', 'Planta Genérica de Valores', 'POLYGON', 4674, TRUE, 4),
('Imóveis (pontos)', 'imoveis-pontos', 'Localização pontual dos imóveis', 'POINT', 4674, TRUE, 5);

-- Privacy Budget inicial
INSERT INTO privacy_budget (dataset_name, epsilon_total, epsilon_consumed, delta, reset_period, next_reset_at) VALUES
('properties', 1.0, 0.0, 0.00001, 'MONTHLY', NOW() + INTERVAL '1 month'),
('addresses', 0.5, 0.0, 0.00001, 'MONTHLY', NOW() + INTERVAL '1 month');
```

---

## 📖 Próximo Documento

[04-API-SPEC.md](04-API-SPEC.md) - Especificação completa das APIs REST

---

**Última atualização**: 23/12/2025
