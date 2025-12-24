# Sistema SaaS de Cadastro Imobiliário Georreferenciado - Salesópolis/SP

## 📋 Sobre o Projeto

Sistema web 100% aderente ao **Pregão Eletrônico nº 16/2025** da Prefeitura da Estância Turística de Salesópolis.

**Objeto**: Solução tecnológica em nuvem (SaaS) para:
- ✅ Mapeamento georreferenciado com suporte a PGV (Planta Genérica de Valores)
- ✅ Recadastramento imobiliário completo
- ✅ Endereçamento digital
- ✅ Publicação de dados públicos com **Privacidade Diferencial**
- ✅ Integração com base cadastral municipal
- ✅ Conformidade LGPD + LAI
- ✅ Disponibilidade mínima: **99,5%**

---

## 🏗️ Arquitetura

### Visão Geral
```
┌─────────────────────────────────────────────────────────────────┐
│                        USUÁRIOS EXTERNOS                         │
│           (Portal Público + API Pública com Privacy)             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    CDN + WAF + Load Balancer                     │
│                    (Cloudflare / AWS CloudFront)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────▼────────┐                  ┌─────────▼────────┐
│  Frontend Web  │                  │   API Gateway    │
│   (React SPA)  │                  │  + Auth Service  │
│   - Admin UI   │◄─────────────────┤  (JWT + RBAC)    │
│   - WebGIS     │                  └─────────┬────────┘
│   - Dashboards │                            │
└────────────────┘                  ┌─────────▼────────────────────┐
                                    │   Backend Microservices      │
                                    │  - GIS Service (PostGIS)     │
                                    │  - Cadastro Service          │
                                    │  - Endereçamento Service     │
                                    │  - Integração Service        │
                                    │  - Privacy Service (DP)      │
                                    │  - Audit/Log Service         │
                                    │  - Suporte/Tickets Service   │
                                    └─────────┬────────────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
          ┌──────────▼───────┐    ┌──────────▼───────┐    ┌──────────▼───────┐
          │  PostgreSQL      │    │  Redis Cache     │    │  S3-Compatible   │
          │  + PostGIS       │    │  + Message Queue │    │  Object Storage  │
          │  (RDS/Aurora)    │    │  (ElastiCache)   │    │  (Docs/Fotos)    │
          └──────────────────┘    └──────────────────┘    └──────────────────┘
                     │
          ┌──────────▼───────────────────────────────────────────────┐
          │  Observability Stack                                     │
          │  - Prometheus + Grafana (Metrics)                        │
          │  - ELK / Loki (Logs)                                     │
          │  - OpenTelemetry (Traces)                                │
          │  - Uptime Monitoring (99.5% SLA)                         │
          └──────────────────────────────────────────────────────────┘
```

### Características da Arquitetura
- **Multi-tenant**: Suporte a múltiplos municípios (se necessário expandir)
- **Escalável**: Auto-scaling horizontal em containers (K8s/ECS)
- **Resiliente**: Health checks, circuit breakers, retry policies
- **Auditável**: Logs imutáveis e trilhas de auditoria para LGPD
- **Seguro**: TLS 1.3, secrets management, RBAC granular

---

## 📦 Stack Tecnológica

### Frontend
- **Framework**: React 18+ com TypeScript
- **Mapa**: Leaflet / OpenLayers + GeoServer/MapServer
- **UI**: Material-UI (MUI) ou Ant Design
- **State**: Redux Toolkit + RTK Query
- **Formulários**: React Hook Form + Zod validation
- **Build**: Vite

### Backend
- **Runtime**: Node.js 20+ (NestJS) ou Python 3.11+ (FastAPI)
- **API**: REST + GraphQL (opcional para consultas complexas)
- **Auth**: JWT + Refresh Token + RBAC
- **GIS**: PostGIS + GDAL/OGR para transformações
- **Privacidade**: Biblioteca DP própria (baseada em Google DP ou IBM Diffprivlib)
- **Jobs**: Bull/BullMQ com Redis

### Banco de Dados
- **Principal**: PostgreSQL 15+ com PostGIS 3.3+
- **Cache**: Redis 7+
- **Busca**: Elasticsearch (opcional para logs e busca textual)

### Infraestrutura
- **Cloud**: AWS (recomendado) / Azure / GCP
- **Containers**: Docker + Kubernetes (EKS) ou ECS Fargate
- **CI/CD**: GitHub Actions / GitLab CI
- **IaC**: Terraform + Ansible
- **Monitoramento**: Prometheus, Grafana, Loki, Uptime Robot

### Observabilidade
- **Métricas**: Prometheus + Grafana
- **Logs**: Loki ou ELK Stack
- **Traces**: OpenTelemetry + Jaeger
- **Alertas**: Alertmanager + PagerDuty/Opsgenie

---

## 📁 Estrutura do Repositório (Monorepo)

```
saas-cadastro-salesopolis/
├── docs/                              # Documentação completa
│   ├── 01-REQUISITOS.md              # Mapa de requisitos do edital
│   ├── 02-ARQUITETURA.md             # Visão detalhada da arquitetura
│   ├── 03-MODELAGEM-DADOS.md         # ERD e DDL
│   ├── 04-API-SPEC.md                # Especificação das APIs
│   ├── 05-SEGURANCA-LGPD.md          # Checklist e controles
│   ├── 06-PRIVACIDADE-DIFERENCIAL.md # Algoritmos e configuração DP
│   ├── 07-INTEGRACAO.md              # Formatos e conectores
│   ├── 08-OPERACAO.md                # Backups, SLA, monitoramento
│   ├── 09-IMPLANTACAO.md             # Roteiro e capacitação
│   ├── 10-ASSUNCOES.md               # Assunções controladas
│   └── 11-VALIDACAO-ADERENCIA.md     # Testes de aceite
│
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                 # Autenticação e autorização (RBAC)
│   │   │   ├── users/                # Gestão de usuários e perfis
│   │   │   ├── gis/                  # Serviços GIS (PostGIS queries)
│   │   │   ├── cadastro/             # Recadastramento imobiliário
│   │   │   ├── enderecamento/        # Endereçamento digital
│   │   │   ├── integracao/           # Import/Export e conectores
│   │   │   ├── privacy/              # Privacidade diferencial
│   │   │   ├── audit/                # Trilha de auditoria e logs
│   │   │   ├── dashboard/            # Painéis e relatórios
│   │   │   ├── suporte/              # Sistema de chamados
│   │   │   └── public-portal/        # API pública com DP
│   │   ├── common/                   # Shared modules (database, config, utils)
│   │   ├── config/                   # Configurações e variáveis de ambiente
│   │   └── main.ts                   # Entry point
│   ├── prisma/                       # Schema e migrations (ou TypeORM)
│   ├── tests/                        # Testes unitários e integração
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MapaGIS.tsx           # Visualização e edição georreferenciada
│   │   │   ├── Recadastro.tsx        # Formulários de recadastro
│   │   │   ├── Enderecamento.tsx     # Gestão de endereços digitais
│   │   │   ├── Integracao.tsx        # Import/Export
│   │   │   ├── Usuarios.tsx          # Admin de usuários
│   │   │   ├── Auditoria.tsx         # Consulta de logs e trilhas
│   │   │   ├── Suporte.tsx           # Central de chamados
│   │   │   └── PortalPublico.tsx     # Dados públicos (DP)
│   │   ├── components/
│   │   │   ├── Map/                  # Componentes de mapa (Leaflet)
│   │   │   ├── Forms/                # Formulários reutilizáveis
│   │   │   ├── Tables/               # Tabelas com paginação/filtro
│   │   │   └── Layout/               # Header, Sidebar, Footer
│   │   ├── services/                 # API clients (axios/fetch)
│   │   ├── store/                    # Redux slices
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils/                    # Helpers
│   │   └── App.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── infrastructure/
│   ├── terraform/                    # IaC para AWS/Azure/GCP
│   │   ├── modules/
│   │   │   ├── vpc/
│   │   │   ├── rds/
│   │   │   ├── ecs/
│   │   │   ├── s3/
│   │   │   └── monitoring/
│   │   ├── main.tf
│   │   └── variables.tf
│   ├── kubernetes/                   # Manifests K8s (se usar K8s)
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── ingress.yaml
│   │   └── configmaps/
│   ├── ansible/                      # Provisionamento e config
│   └── scripts/                      # Scripts de deploy e manutenção
│
├── scripts/
│   ├── backup.sh                     # Backup automatizado
│   ├── restore.sh                    # Restore de backups
│   ├── seed-data.sql                 # Dados iniciais
│   └── health-check.sh               # Verificação de saúde
│
├── tests/
│   ├── e2e/                          # Testes end-to-end (Playwright/Cypress)
│   ├── load/                         # Testes de carga (k6/JMeter)
│   └── security/                     # Testes de segurança (OWASP ZAP)
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI pipeline
│       ├── cd.yml                    # CD pipeline
│       └── security-scan.yml         # Scan de vulnerabilidades
│
├── docker-compose.yml                # Ambiente de desenvolvimento local
├── .env.example                      # Exemplo de variáveis de ambiente
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### Pré-requisitos
- Docker 24+ e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- PostgreSQL 15+ com PostGIS (ou usar via Docker)

### Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/prefeitura-salesopolis/saas-cadastro.git
cd saas-cadastro

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 3. Suba a infraestrutura local
docker-compose up -d

# 4. Execute migrations
cd backend
npm install
npm run migration:run

# 5. Suba o backend
npm run start:dev

# 6. Em outro terminal, suba o frontend
cd ../frontend
npm install
npm run dev
```

Acesse:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

---

## 🔐 Segurança e LGPD

### Controles Implementados
✅ **RBAC (Role-Based Access Control)**: Perfis Admin, Operador, Auditor, Consulta Pública  
✅ **Criptografia**: TLS 1.3 em trânsito; AES-256 em repouso (quando suportado)  
✅ **Logs Imutáveis**: Append-only audit logs com hash chain  
✅ **Registro de Tratamento**: Tabela `lgpd_data_treatment_log` com base legal  
✅ **Privacidade Diferencial**: Ruído Laplace/Gauss em dados públicos  
✅ **Auditoria**: Trilha completa de CREATE/UPDATE/DELETE em tabelas críticas  
✅ **Secrets Management**: Uso de AWS Secrets Manager / HashiCorp Vault  

Veja detalhes em [docs/05-SEGURANCA-LGPD.md](docs/05-SEGURANCA-LGPD.md)

---

## 📊 Disponibilidade: 99,5% SLA

### Estratégias
- **Multi-AZ**: Deploy em múltiplas zonas de disponibilidade
- **Auto-scaling**: Horizontal scaling baseado em CPU/memória
- **Health Checks**: Endpoints `/health` e `/readiness`
- **Circuit Breakers**: Proteção contra falhas em cascata
- **Backups**: Automáticos diários + retenção de 30 dias
- **Disaster Recovery**: RTO < 4h, RPO < 1h
- **Monitoramento 24/7**: Alertas via PagerDuty/Opsgenie

Cálculo: 99,5% = máximo 3h39min de downtime/mês

---

## 📚 Documentação Completa

Consulte a pasta [docs/](docs/) para documentação detalhada:

1. **[Requisitos do Edital](docs/01-REQUISITOS.md)**: Checklist completo
2. **[Arquitetura](docs/02-ARQUITETURA.md)**: Diagramas e decisões técnicas
3. **[Modelagem de Dados](docs/03-MODELAGEM-DADOS.md)**: ERD + DDL
4. **[API Specification](docs/04-API-SPEC.md)**: Endpoints REST + exemplos
5. **[Segurança e LGPD](docs/05-SEGURANCA-LGPD.md)**: Controles e compliance
6. **[Privacidade Diferencial](docs/06-PRIVACIDADE-DIFERENCIAL.md)**: Algoritmos DP
7. **[Integração](docs/07-INTEGRACAO.md)**: Formatos e conectores
8. **[Operação](docs/08-OPERACAO.md)**: Backups, SLA, monitoramento
9. **[Implantação](docs/09-IMPLANTACAO.md)**: Deploy e capacitação
10. **[Assunções Controladas](docs/10-ASSUNCOES.md)**: Decisões técnicas
11. **[Validação de Aderência](docs/11-VALIDACAO-ADERENCIA.md)**: Testes de aceite

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov

# Testes de segurança
npm run test:security
```

---

## 📦 Deploy em Produção

### Via Terraform (AWS)
```bash
cd infrastructure/terraform
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

### Via CI/CD (GitHub Actions)
Push para branch `main` aciona deploy automático após aprovação manual.

---

## 📞 Suporte

- **Email**: suporte@salesopolis.sp.gov.br
- **Telefone**: (11) XXXX-XXXX
- **Sistema de Chamados**: https://cadastro.salesopolis.sp.gov.br/suporte

---

## 📄 Licença

Copyright © 2025 Prefeitura da Estância Turística de Salesópolis.  
Todos os direitos reservados.

---

## 🤝 Contribuindo

Este é um projeto governamental. Contribuições externas devem seguir as diretrizes em [CONTRIBUTING.md](CONTRIBUTING.md).

---

**Última atualização**: 23/12/2025  
**Versão do Sistema**: 1.0.0  
**Status**: Em desenvolvimento ativo
