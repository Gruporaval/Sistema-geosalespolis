# 📦 SQL para Gerenciamento de Categorias

Para gerenciar Bairros e Tipos de Imóveis, precisamos criar tabelas dedicadas.
Execute este script no **SQL Editor** do Supabase:

```sql
-- Criar tabela de Bairros
CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de Tipos de Imóvel
CREATE TABLE IF NOT EXISTS property_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados iniciais (Padrões)
INSERT INTO property_types (name) VALUES
('Residencial'),
('Comercial'),
('Industrial'),
('Rural'),
('Público'),
('Misto')
ON CONFLICT (name) DO NOTHING;

-- Inserir bairros iniciais (Exemplos de Salesópolis)
INSERT INTO neighborhoods (name) VALUES
('Centro'),
('Jardim Nidia'),
('Fartura'),
('Bragança'),
('Nhá Luz'),
('Rosário'),
('Totaitinga')
ON CONFLICT (name) DO NOTHING;

-- IMPORTANTE: Popular bairros/tipos que já existem na tabela properties mas não estão acima
INSERT INTO neighborhoods (name)
SELECT DISTINCT neighborhood FROM properties 
WHERE neighborhood IS NOT NULL 
ON CONFLICT (name) DO NOTHING;

INSERT INTO property_types (name)
SELECT DISTINCT property_type FROM properties 
WHERE property_type IS NOT NULL 
ON CONFLICT (name) DO NOTHING;

-- Desabilitar RLS para permitir edição livre (conforme padrão do projeto)
ALTER TABLE neighborhoods DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_types DISABLE ROW LEVEL SECURITY;
```

## ✅ Depois de executar
Recarregue a página de Categorias para ver a funcionalidade completa!
