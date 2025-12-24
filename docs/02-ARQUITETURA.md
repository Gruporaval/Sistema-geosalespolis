# Arquitetura do Sistema - Detalhamento Técnico

## 🏗️ Visão Geral

O sistema é uma **aplicação SaaS (Software as a Service)** em nuvem, projetada com arquitetura de **microserviços modular**, escalável horizontalmente e com alta disponibilidade (99,5% SLA).

### Princípios Arquiteturais

1. **Separation of Concerns**: Frontend (React SPA) desacoplado do Backend (API REST)
2. **Stateless Services**: Todas as APIs são stateless; estado é gerenciado em Redis/PostgreSQL
3. **Idempotência**: Operações críticas (integração, exportação) são idempotentes
4. **Fail Fast**: Validações early; circuit breakers para dependências externas
5. **Observability**: Logs estruturados, métricas e traces em todos os serviços
6. **Security by Design**: RBAC, criptografia, auditoria desde a concepção

---

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE APRESENTAÇÃO                             │
│  ┌──────────────────────┐           ┌──────────────────────┐               │
│  │  Portal Administrativo│           │   Portal Público     │               │
│  │  (React + TypeScript) │           │  (Dados com DP)      │               │
│  │  - Mapa WebGIS        │           │  - Dashboards        │               │
│  │  - Recadastro         │           │  - Consultas         │               │
│  │  - Dashboards         │           │  - Visualizações     │               │
│  └──────────┬───────────┘           └──────────┬───────────┘               │
│             │                                   │                            │
└─────────────┼───────────────────────────────────┼────────────────────────────┘
              │                                   │
              │ HTTPS (TLS 1.3)                   │ HTTPS (Rate Limited)
              │                                   │
┌─────────────▼───────────────────────────────────▼────────────────────────────┐
│                        CAMADA DE GATEWAY E SEGURANÇA                         │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  API Gateway + WAF (AWS ALB / Cloudflare / NGINX)               │       │
│  │  - Rate Limiting (per IP/User)                                   │       │
│  │  - TLS Termination                                               │       │
│  │  - CORS, CSRF Protection                                         │       │
│  │  - DDoS Mitigation                                               │       │
│  └──────────────────────────┬───────────────────────────────────────┘       │
└─────────────────────────────┼───────────────────────────────────────────────┘
                              │
                              │ JWT Validation
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                       CAMADA DE SERVIÇOS (Backend)                          │
│                                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                  │
│  │ Auth Service  │  │  GIS Service  │  │ Cadastro Svc  │                  │
│  │ - JWT + RBAC  │  │ - PostGIS Q.  │  │ - CRUD Props  │                  │
│  │ - MFA (opt)   │  │ - Geometries  │  │ - Validations │                  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘                  │
│          │                  │                  │                            │
│  ┌───────▼──────────────────▼──────────────────▼───────┐                  │
│  │  Endereçamento  │  Integração  │  Privacy Service   │                  │
│  │  - Geocoding    │  - Import/Exp │  - Differential    │                  │
│  │  - Validation   │  - Connectors │    Privacy (DP)    │                  │
│  └─────────┬───────────────┬───────────────┬────────────┘                  │
│            │               │               │                                │
│  ┌─────────▼───────────────▼───────────────▼────────────┐                  │
│  │  Audit Service  │  Dashboard Svc  │  Suporte Service │                  │
│  │  - Logs         │  - Analytics    │  - Tickets       │                  │
│  │  - Trails       │  - Reports      │  - SLA           │                  │
│  └─────────┬───────────────┬───────────────┬────────────┘                  │
│            │               │               │                                │
└────────────┼───────────────┼───────────────┼────────────────────────────────┘
             │               │               │
             │               │               │
┌────────────▼───────────────▼───────────────▼────────────────────────────────┐
│                        CAMADA DE DADOS                                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────┐             │
│  │  PostgreSQL 15 + PostGIS 3.3 (Multi-AZ, RDS)              │             │
│  │  - Tables: users, properties, gis_features, audit_log     │             │
│  │  - Spatial Indexes: GIST                                   │             │
│  │  - Row-Level Security (RLS) para multi-tenancy            │             │
│  └────────────────────────────────────────────────────────────┘             │
│                                                                              │
│  ┌────────────────────┐         ┌────────────────────┐                     │
│  │  Redis 7           │         │  S3 / MinIO        │                     │
│  │  - Session Cache   │         │  - Attachments     │                     │
│  │  - Token Blacklist │         │  - Reports         │                     │
│  │  - Job Queue       │         │  - Backups         │                     │
│  └────────────────────┘         └────────────────────┘                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Elasticsearch (opcional)                                   │            │
│  │  - Full-text search (propriedades, endereços)              │            │
│  │  - Log aggregation                                          │            │
│  └─────────────────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────────────────┐
│                     CAMADA DE OBSERVABILIDADE                                │
│                                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  Prometheus     │  │  Loki / ELK     │  │  Jaeger         │             │
│  │  (Metrics)      │  │  (Logs)         │  │  (Traces)       │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           └──────────────┬──────────────────────────┘                        │
│                          │                                                   │
│                  ┌───────▼────────┐                                          │
│                  │    Grafana     │                                          │
│                  │  (Dashboards)  │                                          │
│                  └────────────────┘                                          │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────┐             │
│  │  Alertmanager + PagerDuty / Opsgenie                        │             │
│  │  - Alertas críticos: downtime, high latency, errors         │             │
│  └─────────────────────────────────────────────────────────────┘             │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes e Responsabilidades

### 1. Frontend (React SPA)

**Tecnologia**: React 18 + TypeScript + Vite  
**Responsabilidades**:
- Renderizar UI responsiva e acessível (WCAG 2.1 AA)
- Gerenciar estado local (Redux Toolkit)
- Comunicar com Backend via REST API (axios/fetch)
- Renderizar mapas interativos (Leaflet/OpenLayers)
- Validação client-side (Zod + React Hook Form)
- Cache local (IndexedDB para offline-first parcial)

**Principais Módulos**:
- **Login/Auth**: Autenticação JWT, MFA (opcional), gestão de sessão
- **Mapa GIS**: Visualização de camadas, edição de geometrias, filtros espaciais
- **Recadastro**: Formulários dinâmicos, anexos, validação em tempo real
- **Endereçamento**: Consulta e criação de endereços digitais
- **Dashboards**: Painéis configuráveis com gráficos (Chart.js)
- **Integração**: Upload/Download de arquivos, mapeamento de campos
- **Auditoria**: Consulta de logs e trilhas
- **Suporte**: Sistema de tickets
- **Portal Público**: Dados com privacidade diferencial

**Build & Deploy**:
- Build otimizado: code splitting, lazy loading, tree shaking
- Deploy: CloudFront (CDN) + S3 (static hosting)
- CI/CD: GitHub Actions → S3 bucket → invalidação CloudFront

---

### 2. API Gateway + WAF

**Tecnologia**: AWS ALB + WAF / NGINX + ModSecurity  
**Responsabilidades**:
- **TLS Termination**: Certificado SSL/TLS 1.3
- **Rate Limiting**: 100 req/min por IP (ajustável)
- **CORS**: Configuração de origens permitidas
- **DDoS Protection**: AWS Shield / Cloudflare
- **Request Validation**: Reject malformed requests
- **Routing**: Direcionar para serviços backend apropriados

---

### 3. Backend (Microserviços)

#### 3.1. Auth Service
**Responsabilidade**: Autenticação e autorização  
**Endpoints**:
- `POST /auth/login` → JWT + refresh token
- `POST /auth/refresh` → Renovar access token
- `POST /auth/logout` → Invalidar tokens (blacklist)
- `POST /auth/mfa/enable` → Habilitar MFA (TOTP)
- `GET /auth/me` → Informações do usuário logado

**Tecnologias**:
- JWT (jsonwebtoken)
- bcrypt (hash de senhas)
- TOTP (speakeasy) para MFA
- Redis (blacklist de tokens)

**RBAC**:
- Roles: `ADMIN`, `OPERATOR`, `AUDITOR`, `PUBLIC`
- Permissions: `gis:read`, `gis:write`, `cadastro:read`, etc.
- Middleware: `@RequirePermissions(['cadastro:write'])`

---

#### 3.2. GIS Service
**Responsabilidade**: Operações geoespaciais  
**Endpoints**:
- `GET /gis/layers` → Lista de camadas disponíveis
- `GET /gis/features?layer=:layer&bbox=:bbox` → Buscar feições por bounding box
- `POST /gis/features` → Criar nova geometria (com auditoria)
- `PUT /gis/features/:id` → Atualizar geometria
- `DELETE /gis/features/:id` → Deletar geometria (soft delete)
- `GET /gis/export?layer=:layer&format=:format` → Exportar (Shapefile, GeoJSON, KML)

**Tecnologias**:
- PostGIS: queries espaciais (`ST_Contains`, `ST_Intersects`, `ST_Buffer`)
- GDAL/OGR: conversão de formatos
- GeoServer (opcional): WMS/WFS para visualização avançada

**Validações**:
- Geometrias válidas: `ST_IsValid(geometry)`
- SRID correto: 4674 (SIRGAS 2000) ou 4326 (WGS84)
- Topologia: evitar overlaps em camadas de lotes

---

#### 3.3. Cadastro Service
**Responsabilidade**: CRUD de imóveis e recadastramento  
**Endpoints**:
- `GET /cadastro/properties?filter=:filter&page=:page` → Listar propriedades
- `GET /cadastro/properties/:id` → Detalhe de propriedade
- `POST /cadastro/properties` → Criar propriedade
- `PATCH /cadastro/properties/:id` → Atualizar propriedade (com histórico)
- `DELETE /cadastro/properties/:id` → Deletar propriedade (soft delete)
- `POST /cadastro/properties/:id/attachments` → Upload de anexos (S3)
- `GET /cadastro/properties/:id/history` → Histórico de alterações

**Validações**:
- CPF/CNPJ: algoritmo validador
- Área: > 0 e consistente com geometria
- Endereço: validação com ViaCEP
- Deduplicação: matching por CPF + nome + endereço

**Auditoria**:
- Trigger no banco: ao UPDATE/DELETE, inserir em `property_history`
- Log em `audit_log` com user_id, action, timestamp, changes (JSON)

---

#### 3.4. Endereçamento Service
**Responsabilidade**: Gestão de endereços digitais  
**Endpoints**:
- `GET /enderecamento/addresses?q=:query` → Buscar endereços
- `GET /enderecamento/addresses/:id` → Detalhe de endereço
- `POST /enderecamento/addresses` → Criar endereço digital
- `PUT /enderecamento/addresses/:id` → Atualizar endereço
- `POST /enderecamento/geocode` → Geocodificar endereço (endereço → lat/lng)
- `POST /enderecamento/reverse-geocode` → Geocodificação reversa (lat/lng → endereço)

**Modelo de Endereço Digital**:
```json
{
  "id": "uuid",
  "codigo": "SAL-2025-00001", // Código legível
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 45",
  "bairro": "Centro",
  "cep": "08970-000",
  "municipio": "Salesópolis",
  "uf": "SP",
  "latitude": -23.5321,
  "longitude": -45.8472,
  "property_id": "uuid (FK)",
  "created_at": "2025-12-23T10:00:00Z"
}
```

**Geocodificação**:
- Interna: match com tabela `streets` (PostGIS ST_Distance)
- Fallback: API Nominatim (OpenStreetMap) ou Google Geocoding API

---

#### 3.5. Integração Service
**Responsabilidade**: Import/Export e conectores  
**Endpoints**:
- `POST /integracao/import` → Upload de arquivo (CSV/XLSX/JSON)
- `POST /integracao/export` → Gerar arquivo de exportação
- `GET /integracao/mappings` → Listar mapeamentos de campos
- `POST /integracao/mappings` → Criar novo mapeamento
- `GET /integracao/jobs/:id` → Status de job de integração
- `POST /integracao/connectors/:connector_id/sync` → Sincronizar via API externa

**Fluxo de Importação**:
1. Upload de arquivo → S3
2. Parser (Papa Parse para CSV, xlsx para XLSX)
3. Validação de schema (Zod)
4. Mapeamento de campos (user-defined)
5. Inserção em tabela staging
6. Deduplicação
7. Inserção/Atualização em tabelas principais
8. Geração de relatório de erros
9. Log em `integration_logs`

**Formatos Suportados**:
- CSV (delimitadores: `,` `;` `\t`)
- XLSX (Excel)
- JSON (array de objetos)
- Shapefile (para geometrias)
- GeoJSON

---

#### 3.6. Privacy Service (Privacidade Diferencial)
**Responsabilidade**: Aplicar DP em queries públicas  
**Endpoints**:
- `GET /public/stats/count?dataset=:dataset&filter=:filter` → Contagem com DP
- `GET /public/stats/sum?dataset=:dataset&column=:column` → Soma com DP
- `GET /public/stats/mean?dataset=:dataset&column=:column` → Média com DP
- `GET /public/stats/histogram?dataset=:dataset&column=:column&bins=:n` → Histograma com DP

**Algoritmo DP**:
- **Laplace Mechanism**: Para contagens e somas
- **Gaussian Mechanism**: Para médias (maior utilidade em alguns casos)
- **Threshold Suppression**: Células < 5 são suprimidas
- **Budget Management**: Cada query consome epsilon do orçamento

**Exemplo de Implementação (Pseudocódigo)**:
```typescript
function applyLaplaceNoise(trueValue: number, sensitivity: number, epsilon: number): number {
  const scale = sensitivity / epsilon;
  const noise = laplace(0, scale); // Biblioteca: laplace-noise ou implementação própria
  return trueValue + noise;
}

// Query: COUNT de propriedades por bairro
const trueCount = await db.query('SELECT COUNT(*) FROM properties WHERE bairro = ?', [bairro]);
const noisyCount = applyLaplaceNoise(trueCount, 1, epsilon);
return Math.max(0, Math.round(noisyCount)); // Não permitir valores negativos
```

**Budget**:
- Tabela `privacy_budget`: { dataset, epsilon_total, epsilon_consumed, reset_period }
- Cada query: `epsilon_consumed += query_epsilon`
- Se `epsilon_consumed > epsilon_total`: rejeitar query
- Reset: diário/semanal/mensal (configurável)

---

#### 3.7. Audit Service
**Responsabilidade**: Logs e trilhas de auditoria  
**Endpoints**:
- `GET /audit/logs?user_id=:id&action=:action&start_date=:date` → Listar logs
- `GET /audit/logs/:id` → Detalhe de log
- `GET /audit/compliance-report` → Relatório de conformidade LGPD

**Tabela `audit_log`**:
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'READ', 'EXPORT', etc.
  entity_type VARCHAR(100), -- 'property', 'user', 'gis_feature', etc.
  entity_id UUID,
  changes JSONB, -- Before/After
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  hash VARCHAR(64) -- SHA-256 hash of (id || previous_hash || data) for immutability
);

CREATE INDEX idx_audit_user ON audit_log(user_id, timestamp DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
```

**Hash Chain (Immutability)**:
- Cada log tem hash = SHA256(id || previous_hash || data)
- Permite detectar adulteração

---

#### 3.8. Dashboard Service
**Responsabilidade**: Agregações e relatórios  
**Endpoints**:
- `GET /dashboard/metrics` → KPIs principais
- `GET /dashboard/charts/properties-by-region` → Dados para gráfico
- `POST /dashboard/reports` → Gerar relatório (PDF/CSV)
- `GET /dashboard/reports/:id` → Download de relatório

**Métricas**:
- Total de propriedades cadastradas
- % de recadastramento concluído
- Propriedades por bairro/zona/tipo de uso
- Evolução temporal (time series)
- Mapas temáticos (heatmap de densidade)

---

#### 3.9. Suporte Service
**Responsabilidade**: Sistema de tickets  
**Endpoints**:
- `POST /suporte/tickets` → Criar ticket
- `GET /suporte/tickets` → Listar tickets (com filtros)
- `GET /suporte/tickets/:id` → Detalhe do ticket
- `PATCH /suporte/tickets/:id` → Atualizar status/prioridade
- `POST /suporte/tickets/:id/messages` → Adicionar mensagem
- `GET /suporte/tickets/:id/messages` → Histórico de mensagens

**Tabela `support_tickets`**:
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES users(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  category VARCHAR(50), -- 'TECHNICAL', 'DATA', 'ACCESS', 'OTHER'
  status VARCHAR(20) CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED')),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ -- Calculado com base na prioridade
);
```

**SLA**:
- HIGH: 4h para primeira resposta
- MEDIUM: 8h
- LOW: 24h
- Alertas: se SLA prestes a vencer, notificar via email/Slack

---

## 🗄️ Camada de Dados

### PostgreSQL + PostGIS
**Configuração**:
- Versão: PostgreSQL 15 + PostGIS 3.3
- Deployment: RDS Multi-AZ (AWS) ou equivalente
- Backup: Automated daily snapshots + retenção 30 dias
- Encryption: At rest (AES-256) e in transit (TLS)

**Principais Tabelas**: Ver `docs/03-MODELAGEM-DADOS.md`

### Redis
**Uso**:
- Session cache (JWT refresh tokens)
- Token blacklist (logout)
- Job queue (Bull/BullMQ)
- Rate limiting counters
- Cache de queries frequentes (ex: lista de municípios)

**Configuração**:
- Versão: Redis 7
- Deployment: ElastiCache (AWS) Multi-AZ
- Persistence: RDB snapshots + AOF

### S3 / MinIO
**Uso**:
- Attachments (documentos, fotos de imóveis)
- Relatórios gerados (PDF, CSV)
- Backups de banco
- Arquivos de importação/exportação

**Estrutura de Buckets**:
```
bucket-name/
├── attachments/
│   └── properties/
│       └── {property_id}/
│           ├── documento1.pdf
│           └── foto1.jpg
├── reports/
│   └── {year}/
│       └── {month}/
│           └── report-{id}.pdf
└── backups/
    └── {date}/
        └── db-backup.sql.gz
```

**Políticas**:
- Lifecycle: Mover para Glacier após 90 dias (backups)
- Encryption: Server-side encryption (SSE-S3 ou SSE-KMS)
- Access: IAM roles + bucket policies (least privilege)

---

## 🔍 Observabilidade

### Métricas (Prometheus + Grafana)
**Métricas Coletadas**:
- **Aplicação**: request rate, latency (p50, p95, p99), error rate
- **Negócio**: cadastros/dia, integrações executadas, queries públicas
- **Infraestrutura**: CPU, memória, disco, rede
- **Banco**: connections, query time, locks

**Dashboards Grafana**:
- Overview (saúde geral do sistema)
- API Performance (latência por endpoint)
- SLA Tracking (uptime, availability)
- Business Metrics (KPIs)

### Logs (Loki / ELK)
**Formato de Log**:
```json
{
  "timestamp": "2025-12-23T10:30:00Z",
  "level": "INFO",
  "service": "gis-service",
  "trace_id": "abc123",
  "user_id": "uuid",
  "action": "CREATE_FEATURE",
  "message": "Feature created successfully",
  "metadata": { "layer": "properties", "feature_id": "uuid" }
}
```

**Retenção**:
- Hot storage: 7 dias
- Warm storage: 30 dias
- Cold storage (S3): 1 ano

### Traces (Jaeger + OpenTelemetry)
**Uso**: Rastreamento de requests distribuídos entre microserviços

**Exemplo de Trace**:
```
POST /cadastro/properties
  └─ Auth Middleware (2ms)
  └─ Validate Payload (5ms)
  └─ Check Duplicates (20ms)
     └─ PostgreSQL Query (18ms)
  └─ Insert Property (30ms)
     └─ PostgreSQL Insert (25ms)
  └─ Create Audit Log (10ms)
  └─ Return Response (2ms)
Total: 69ms
```

### Alertas
**Canais**: PagerDuty, Slack, Email  
**Regras**:
- Error rate > 5% por 5min → CRITICAL
- Latency p95 > 1s por 5min → WARNING
- Availability < 99.5% → CRITICAL
- Disk usage > 80% → WARNING
- Failed backups → CRITICAL

---

## 🔐 Segurança

### Network Security
- **VPC**: Subnets privadas para DB e backend; públicas para ALB
- **Security Groups**: Least privilege (ex: DB aceita apenas backend)
- **WAF**: Proteção contra OWASP Top 10 (SQL injection, XSS, etc.)

### Application Security
- **Input Validation**: Zod schemas para todos os payloads
- **Output Encoding**: Sanitização de HTML/SQL
- **CSRF**: Tokens CSRF em formulários
- **Rate Limiting**: 100 req/min por IP
- **SQL Injection**: Uso de prepared statements (Prisma/TypeORM)

### Secrets Management
- **AWS Secrets Manager** / **HashiCorp Vault**
- Rotação automática de credenciais
- Nunca commitar secrets no Git

---

## 📈 Escalabilidade

### Horizontal Scaling
- **Backend**: Auto-scaling baseado em CPU (target: 70%)
- **Frontend**: CDN com cache agressivo
- **Database**: Read replicas para queries pesadas (relatórios)

### Vertical Scaling
- PostgreSQL: Upgrade de instância conforme crescimento
- Redis: Cluster mode para high throughput

### Caching Strategy
- **Client-side**: Service Worker para assets estáticos
- **CDN**: CloudFront com TTL de 24h para JS/CSS
- **API**: Redis cache para queries de leitura (TTL: 5-60min)
- **Database**: Materialized views para agregações complexas

---

## 🚀 Deployment

### Ambientes
1. **Development**: Local (Docker Compose)
2. **Staging**: AWS ECS/EKS com dados anonimizados
3. **Production**: AWS ECS/EKS Multi-AZ

### CI/CD Pipeline (GitHub Actions)
```yaml
stages:
  - lint: ESLint, Prettier
  - test: Unit tests (Jest) + Integration tests
  - build: Docker image build
  - security: Snyk/Trivy scan
  - deploy-staging: Deploy to staging (manual approval)
  - e2e: Playwright tests
  - deploy-production: Deploy to production (manual approval)
  - smoke-tests: Health checks
```

### Blue/Green Deployment
- Manter versão anterior rodando
- Testar nova versão
- Switch de tráfego (ALB target group)
- Rollback rápido se necessário

---

## 📚 Decisões Arquiteturais (ADRs)

### ADR-001: Escolha de Monorepo vs Multi-repo
**Decisão**: Monorepo  
**Justificativa**: Facilita compartilhamento de tipos (TypeScript) e refactorings cross-module  
**Trade-off**: Requer tooling adequado (Turborepo/Nx)

### ADR-002: REST vs GraphQL
**Decisão**: REST principal, GraphQL opcional para dashboards  
**Justificativa**: REST mais simples para maior parte dos casos; GraphQL para queries complexas de dashboard  

### ADR-003: PostgreSQL vs MongoDB
**Decisão**: PostgreSQL + PostGIS  
**Justificativa**: Dados estruturados, suporte GIS nativo, ACID completo, melhor para dados governamentais

### ADR-004: Serverless vs Containers
**Decisão**: Containers (ECS/EKS)  
**Justificativa**: Maior controle, melhor para workloads previsíveis, suporte a PostGIS e jobs longos

---

**Próximo documento**: [03-MODELAGEM-DADOS.md](03-MODELAGEM-DADOS.md)
