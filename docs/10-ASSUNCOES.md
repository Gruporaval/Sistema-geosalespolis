# Assunções Controladas - Decisões Técnicas

## 📋 Introdução

Este documento lista as **assunções técnicas** feitas durante o design e implementação do sistema, em casos onde o **Edital Pregão Eletrônico nº 16/2025** não especificou detalhes técnicos suficientes.

Todas as assunções são **configuráveis** e podem ser ajustadas durante a implantação conforme necessidades específicas da Prefeitura de Salesópolis.

---

## 🗺️ 1. Sistema de Referência Espacial (SRS)

### Assunção
**SRID padrão**: SIRGAS 2000 / EPSG:4674

**Justificativa**:
- SIRGAS 2000 é o sistema oficial do Brasil (IBGE, Decreto 5.334/2005)
- Compatível com GPS
- Suporte nativo no PostGIS

**Alternativas consideradas**:
- WGS84 (EPSG:4326): Usado por GPS, mas SIRGAS é mais preciso para Brasil
- UTM Zone 23S (EPSG:31983): Usado em alguns municípios, mas menos universal

**Configurável em**: `gis_layers.srid`

**Como alterar**:
1. Atualizar seed data: `INSERT INTO gis_layers (srid) VALUES (31983)`
2. Reprocessar geometrias: `ST_Transform(geometry, 31983)`

---

## 🏷️ 2. Formato de Endereço Digital

### Assunção
**Código**: `SAL-{ANO}-{SEQUENCIAL}`

**Exemplo**: `SAL-2025-00001`, `SAL-2025-00002`, ...

**Campos**:
- logradouro, numero, complemento, bairro, cep, municipio, uf
- latitude, longitude (geocodificadas)

**Justificativa**:
- Código legível e único
- Fácil de comunicar verbalmente
- Sequencial permite rastreamento cronológico

**Alternativas consideradas**:
- UUID: Menos legível
- Código postal + número: Não único para complementos

**Configurável em**: Variável de ambiente `DIGITAL_ADDRESS_PREFIX` (default: "SAL")

---

## 🌐 3. Serviço de Geocodificação

### Assunção
**Primário**: Serviço interno (match com tabela `streets` via PostGIS ST_Distance)  
**Fallback**: Nominatim (OpenStreetMap)  
**Opcional**: Google Geocoding API (requer API key)

**Justificativa**:
- Nominatim é gratuito e open-source
- Serviço interno reduz dependências externas
- Google oferece melhor qualidade mas tem custo

**Configurável em**: `.env`
```env
GEOCODING_PRIMARY=internal
GEOCODING_FALLBACK=nominatim
NOMINATIM_URL=https://nominatim.openstreetmap.org
GOOGLE_GEOCODING_API_KEY=
```

**Como alternar para Google**:
1. Obter API key: https://console.cloud.google.com/
2. Configurar `GEOCODING_FALLBACK=google`
3. Adicionar `GOOGLE_GEOCODING_API_KEY` no .env

---

## 📊 4. Parâmetros de Privacidade Diferencial

### Assunção
**Epsilon padrão**: 0.1 por query  
**Orçamento mensal**: 1.0 (permite ~10 queries/mês)  
**Delta**: $10^{-5}$  
**Threshold de supressão**: 5 registros

**Justificativa**:
- Epsilon 0.1 oferece boa privacidade com utilidade razoável
- Orçamento mensal evita exaustão muito rápida
- Threshold 5 é padrão em estatísticas públicas (ex: IBGE)

**Configurável em**: `.env` e `privacy_budget` table
```env
DP_DEFAULT_EPSILON=0.1
DP_DEFAULT_DELTA=0.00001
DP_MIN_CELL_SIZE=5
DP_PROPERTIES_TOTAL_BUDGET=1.0
```

**Como ajustar**:
1. **Mais privacidade**: Diminuir epsilon (ex: 0.05)
2. **Mais utilidade**: Aumentar epsilon (ex: 0.5)
3. **Mais queries**: Aumentar orçamento total (ex: 2.0)

---

## 🔄 5. Formatos de Integração

### Assunção
**Importação suportada**:
- CSV (delimitadores: `,` `;` `\t`)
- XLSX (Excel)
- JSON (array de objetos)
- Shapefile (para geometrias)
- GeoJSON

**Exportação suportada**:
- CSV, XLSX, JSON (dados tabulares)
- Shapefile, GeoJSON, KML (dados espaciais)

**Encoding**: UTF-8 (padrão)

**Justificativa**:
- Formatos mais comuns em sistemas municipais
- Interoperabilidade com QGIS, Excel, sistemas legados

**Configurável em**: Código (`IntegracaoService`)

**Como adicionar novo formato**:
1. Instalar biblioteca parser (ex: `xml2js` para XML)
2. Implementar parser em `IntegracaoService`
3. Adicionar no enum `SupportedFormats`

---

## 🏛️ 6. Camadas GIS Iniciais

### Assunção
**Camadas padrão**:
1. Lotes (POLYGON)
2. Quadras (POLYGON)
3. Logradouros (LINESTRING)
4. Zonas PGV (POLYGON)
5. Imóveis - pontos (POINT)

**Justificativa**:
- Estrutura típica de cadastro imobiliário urbano
- Alinhado com metodologias de cadastro multifinalitário

**Configurável em**: Seed data (`prisma/seed.ts`)

**Como adicionar nova camada**:
```sql
INSERT INTO gis_layers (name, slug, geometry_type, srid, is_visible)
VALUES ('Hidrografia', 'hidrografia', 'LINESTRING', 4674, TRUE);
```

---

## 🔢 7. Modelo de Dados Imobiliários

### Assunção
**Campos obrigatórios**:
- codigo_imovel (único)
- tipo_imovel (ENUM)
- area_terreno (m²)
- proprietario_nome
- proprietario_cpf_cnpj

**Campos opcionais**:
- area_construida, inscricao_municipal, matricula_registro, observacoes

**Tipos de Imóvel**:
- RESIDENCIAL, COMERCIAL, INDUSTRIAL, RURAL, MISTO, OUTRO

**Justificativa**:
- Alinhado com Código Tributário Nacional (CTN)
- Campos mínimos para gestão tributária

**Configurável em**: Schema Prisma + Migrations

**Como adicionar campo customizado**:
1. Adicionar no schema Prisma: `new_field String?`
2. Gerar migration: `npm run migration:generate add_new_field`
3. Executar: `npm run migration:run`

---

## 🚀 8. Provedor de Nuvem

### Assunção
**Primário**: AWS (Amazon Web Services)  
**Alternativas suportadas**: Azure, GCP

**Serviços AWS utilizados**:
- **Compute**: ECS Fargate (containers) ou EKS (Kubernetes)
- **Database**: RDS PostgreSQL Multi-AZ
- **Cache**: ElastiCache Redis
- **Storage**: S3
- **CDN**: CloudFront
- **Monitoring**: CloudWatch + Prometheus/Grafana

**Justificativa**:
- AWS é líder de mercado e oferece todos os serviços necessários
- Experiência da equipe
- Preços competitivos com desconto governamental

**Configurável em**: Infrastructure as Code (Terraform modules)

**Como migrar para Azure**:
1. Atualizar Terraform: usar `azurerm` provider
2. Mapear serviços: ECS → Azure Container Instances, RDS → Azure Database for PostgreSQL
3. Ajustar variáveis de ambiente

---

## ⏱️ 9. SLA e Disponibilidade

### Assunção
**Disponibilidade mínima**: 99,5% (conforme edital)

**Cálculo**:
- 99,5% = máximo 3h39min de downtime por mês
- 99,9% = máximo 43min de downtime por mês (objetivo interno)

**Estratégias**:
- Multi-AZ deployment
- Auto-scaling (min 2 réplicas)
- Health checks: `/health`, `/readiness`
- Circuit breakers (Resilience4j)
- Database read replicas

**Configurável em**: Infrastructure (Terraform)

---

## 📧 10. Notificações e Alertas

### Assunção
**Canais**:
- Email (SMTP)
- Slack/Teams (webhooks)
- PagerDuty (para incidentes críticos)

**Eventos notificados**:
- Downtime > 1 minuto
- Error rate > 5% por 5 minutos
- Budget DP esgotado
- Falha em backup
- Ticket SLA próximo de vencer

**Justificativa**:
- Canais amplamente utilizados
- Integração nativa com ferramentas de monitoramento

**Configurável em**: `.env` + Alertmanager config
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alertas@salesopolis.sp.gov.br
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PAGERDUTY_API_KEY=
```

---

## 🗄️ 11. Retenção de Dados

### Assunção
**Políticas**:
- Cadastro imobiliário: Indeterminado (obrigação legal)
- Logs de auditoria: 5 anos (LGPD Art. 16)
- Logs de autenticação: 1 ano
- Attachments: 5 anos
- Backups: 30 dias (daily), 12 meses (monthly)

**Justificativa**:
- Alinhado com LGPD e boas práticas
- Cadastro imobiliário é documento público permanente

**Configurável em**: `.env` + Jobs agendados
```env
AUDIT_LOG_RETENTION_YEARS=5
AUTH_LOG_RETENTION_YEARS=1
BACKUP_DAILY_RETENTION_DAYS=30
BACKUP_MONTHLY_RETENTION_MONTHS=12
```

---

## 🧪 12. Ambientes

### Assunção
**Ambientes**:
1. **Development**: Local (Docker Compose)
2. **Staging**: AWS ECS/EKS (dados anonimizados)
3. **Production**: AWS ECS/EKS Multi-AZ

**Justificativa**:
- Desenvolvimento local rápido
- Staging para testes antes de produção
- Produção isolada e segura

**Configurável em**: `.env` por ambiente
```
NODE_ENV=development | staging | production
```

---

## 🔐 13. Autenticação de Usuários Externos (Portal Público)

### Assunção
**Acesso público**: Sem autenticação (rate limited)  
**Acesso autenticado interno**: JWT

**Futuro (se necessário)**:
- Integração com gov.br (Login Único)
- OAuth2 / OIDC

**Justificativa**:
- Portal público deve ser acessível sem login (LAI)
- Autenticação interna robusta com RBAC

**Configurável em**: Código (`AuthModule`)

**Como adicionar gov.br**:
1. Registrar aplicação em https://sou.gov.br/
2. Implementar OAuth2 strategy (Passport)
3. Adicionar botão "Login com gov.br" no frontend

---

## 📱 14. Suporte a Mobile

### Assunção
**Abordagem**: Responsive Web Design (RWD)  
**Não**: App nativo (iOS/Android)

**Justificativa**:
- Single codebase (React)
- Funciona em qualquer dispositivo
- Custo menor

**Futuro (se demanda)**:
- PWA (Progressive Web App) com offline-first
- React Native para app nativo

**Configurável em**: Frontend (CSS media queries)

---

## 🌍 15. Internacionalização (i18n)

### Assunção
**Idioma único**: Português (pt-BR)

**Futuro (se necessário)**:
- Inglês (en-US) para internacionalização
- Usar biblioteca `react-i18next`

**Justificativa**:
- Sistema governamental municipal brasileiro
- Público-alvo fala português

**Configurável em**: `i18n.config.ts` (se implementar)

---

## 🔄 16. Sincronização com Sistema Legado

### Assunção
**Abordagem**: ETL (Extract, Transform, Load) manual via importação  
**Não**: Sincronização em tempo real

**Futuro (se necessário)**:
- API integration via webhooks
- CDC (Change Data Capture) com Debezium

**Justificativa**:
- Sistema legado pode não ter API
- ETL mais simples de implementar

**Configurável em**: `IntegracaoService` + mapeamentos

---

## ✅ Resumo das Assunções

| # | Assunção | Padrão | Configurável? |
|---|----------|--------|---------------|
| 1 | SRS | SIRGAS 2000 (EPSG:4674) | ✅ Sim |
| 2 | Código Endereço Digital | SAL-{ANO}-{SEQ} | ✅ Sim |
| 3 | Geocodificação | Nominatim (fallback) | ✅ Sim |
| 4 | DP Epsilon | 0.1 | ✅ Sim |
| 5 | Formatos Integração | CSV, XLSX, JSON, Shapefile, GeoJSON | ✅ Sim |
| 6 | Camadas GIS | Lotes, Quadras, Logradouros, PGV, Imóveis | ✅ Sim |
| 7 | Campos Imóvel | codigo, tipo, área, proprietário | ✅ Sim |
| 8 | Cloud Provider | AWS | ✅ Sim |
| 9 | SLA | 99,5% | ✅ Sim (monitoramento) |
| 10 | Notificações | Email, Slack | ✅ Sim |
| 11 | Retenção Logs | 5 anos (auditoria) | ✅ Sim |
| 12 | Ambientes | Dev, Staging, Prod | ✅ Sim |
| 13 | Auth Pública | Sem login (rate limited) | ✅ Sim |
| 14 | Mobile | Responsive Web | ✅ Futuro (PWA/Native) |
| 15 | i18n | Português apenas | ✅ Futuro |
| 16 | Sincronização | ETL manual | ✅ Futuro (API) |

---

## 📝 Como Alterar Assunções

1. **Durante Implantação**:
   - Revisar este documento com equipe técnica da Prefeitura
   - Ajustar variáveis de ambiente (`.env`)
   - Alterar seed data (`prisma/seed.ts`)
   - Reprocessar migrations se necessário

2. **Durante Operação**:
   - Criar ADR (Architecture Decision Record) documentando mudança
   - Testar em ambiente de staging
   - Aplicar em produção com rollback plan

3. **Contato para Suporte**:
   - Email: suporte@salesopolis.sp.gov.br
   - Equipe técnica: tech@empresa-contratada.com.br

---

## 📖 Próximo Documento

[11-VALIDACAO-ADERENCIA.md](11-VALIDACAO-ADERENCIA.md) - Roteiro de testes de aceite

---

**Última atualização**: 23/12/2025
