# Mapa de Requisitos do Edital - Pregão Eletrônico nº 16/2025

## 📋 Checklist de Aderência ao Edital

### 1. Mapeamento Georreferenciado

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 1.1 | Visualização de mapa interativo | `frontend/pages/MapaGIS.tsx` + `backend/modules/gis` | ✅ |
| 1.2 | Suporte a PGV (Planta Genérica de Valores) | Camada `pgv_zones` em PostGIS + UI de visualização | ✅ |
| 1.3 | Camadas (layers) configuráveis | `gis_layers` table + controle dinâmico | ✅ |
| 1.4 | Operações: consultar, filtrar, selecionar | API `/gis/features/query` + UI filtros | ✅ |
| 1.5 | Medição de distâncias e áreas | Frontend: Leaflet.measure plugin | ✅ |
| 1.6 | Exportação de dados geográficos (Shapefile, GeoJSON, KML) | API `/gis/export` com permissões RBAC | ✅ |
| 1.7 | Edição controlada de feições | API `/gis/features/:id` (PUT/DELETE) + auditoria | ✅ |
| 1.8 | Projeções cartográficas (SIRGAS 2000, WGS84) | PostGIS SRID 4674 (SIRGAS 2000) e 4326 (WGS84) | ✅ |

### 2. Recadastramento Imobiliário

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 2.1 | Cadastro de imóveis (identificação, proprietário, área, uso) | `backend/modules/cadastro` + tabela `properties` | ✅ |
| 2.2 | Atualização de dados cadastrais existentes | API PATCH `/cadastro/properties/:id` | ✅ |
| 2.3 | Vinculação imóvel ↔ geometria | FK `geometry_id` em `properties` | ✅ |
| 2.4 | Histórico de alterações | Tabela `property_history` + trigger automático | ✅ |
| 2.5 | Anexo de documentos e fotos | S3 storage + tabela `property_attachments` | ✅ |
| 2.6 | Validações cadastrais (CPF/CNPJ, área, endereço) | Middleware de validação (Zod schemas) | ✅ |
| 2.7 | Busca e filtros avançados | API `/cadastro/properties/search` + ElasticSearch (opcional) | ✅ |
| 2.8 | Deduplicação de registros | Algoritmo de matching (nome + CPF/endereço) | ✅ |

### 3. Endereçamento Digital

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 3.1 | Modelo de endereço digital único | Tabela `digital_addresses` com UUID + código legível | ✅ |
| 3.2 | Associação endereço ↔ imóvel | FK `digital_address_id` em `properties` | ✅ |
| 3.3 | Geocodificação (endereço → coordenadas) | Serviço interno + fallback para API externa (Nominatim) | ✅ |
| 3.4 | Geocodificação reversa (coordenadas → endereço) | PostGIS ST_Distance + tabela `streets` | ✅ |
| 3.5 | Consulta pública de endereços (com restrições) | API pública `/public/addresses/lookup` + rate limiting | ✅ |
| 3.6 | Validação de formato (CEP, logradouro, número) | Validators + integração ViaCEP | ✅ |

### 4. Dados Públicos com Privacidade Diferencial

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 4.1 | Portal público de dados agregados | `frontend/pages/PortalPublico.tsx` | ✅ |
| 4.2 | Implementação de privacidade diferencial (DP) | `backend/modules/privacy` com algoritmo Laplace | ✅ |
| 4.3 | Orçamento de privacidade (epsilon/delta) | Tabela `privacy_budget` + controle por dataset | ✅ |
| 4.4 | Registro de consultas públicas | Tabela `public_queries_log` + consumo de budget | ✅ |
| 4.5 | Prevenção de reidentificação | Supressão de células < threshold + adição de ruído | ✅ |
| 4.6 | Métricas públicas: contagens, médias, histogramas | Endpoints `/public/stats/*` com DP aplicado | ✅ |
| 4.7 | Dashboards públicos interativos | React + Chart.js/D3.js + dados com DP | ✅ |

### 5. Integração com Base Cadastral Municipal

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 5.1 | Importação de dados (CSV, XLSX, JSON) | API `/integracao/import` + parser multiformat | ✅ |
| 5.2 | Exportação de dados | API `/integracao/export` com formato selecionável | ✅ |
| 5.3 | Conectores via API REST | API `/integracao/connectors` + webhook support | ✅ |
| 5.4 | Mapeamento de campos (field mapping) | UI de configuração + tabela `integration_mappings` | ✅ |
| 5.5 | Validação e relatório de erros | Validação em etapas + tabela `integration_logs` | ✅ |
| 5.6 | Sincronização bidirecional (opcional) | Jobs agendados com Bull/BullMQ | ✅ |
| 5.7 | Auditoria de integrações | Log de cada operação em `audit_log` | ✅ |

### 6. Dashboards e Painéis Gerenciais

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 6.1 | Painel de indicadores configuráveis | `frontend/pages/Dashboard.tsx` + widgets dinâmicos | ✅ |
| 6.2 | Mapas temáticos (coropleth, heat maps) | Leaflet.heat + API de agregações espaciais | ✅ |
| 6.3 | Gráficos e visualizações (barras, pizza, linhas) | Chart.js / Recharts | ✅ |
| 6.4 | Filtros temporais e espaciais | Componente DateRangePicker + mapa de seleção | ✅ |
| 6.5 | Exportação de relatórios (PDF, CSV) | Biblioteca pdfmake (PDF) + papaparse (CSV) | ✅ |
| 6.6 | Acompanhamento de evolução do recadastro | Métricas: % concluído, pendências, por região | ✅ |

### 7. Autenticação, Autorização e Gestão de Usuários

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 7.1 | Autenticação segura (login/senha + MFA opcional) | JWT + bcrypt + TOTP (opcional) | ✅ |
| 7.2 | RBAC (controle de acesso por perfil) | Tabela `roles` + `permissions` + middleware | ✅ |
| 7.3 | Perfis: Admin, Operador, Auditor, Consulta Pública | Seed data com perfis padrão | ✅ |
| 7.4 | Gestão de usuários (CRUD) | API `/users` + UI `frontend/pages/Usuarios.tsx` | ✅ |
| 7.5 | Controle de sessão e expiração de token | Refresh token + blacklist em Redis | ✅ |
| 7.6 | Auditoria de login/logout | Tabela `auth_log` | ✅ |

### 8. Segurança e Conformidade (LGPD + LAI)

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 8.1 | Confidencialidade: criptografia em trânsito (TLS 1.3) | Nginx/ALB com certificado SSL | ✅ |
| 8.2 | Confidencialidade: criptografia em repouso (AES-256) | RDS encryption + S3 encryption at rest | ✅ |
| 8.3 | Integridade: checksum e assinaturas | Hash SHA-256 em arquivos críticos | ✅ |
| 8.4 | Rastreabilidade: logs de auditoria imutáveis | Tabela `audit_log` append-only + hash chain | ✅ |
| 8.5 | Registro de tratamento de dados (LGPD Art. 37) | Tabela `lgpd_data_treatment_log` | ✅ |
| 8.6 | Base legal documentada para cada tratamento | Campo `legal_basis` em `lgpd_data_treatment_log` | ✅ |
| 8.7 | Evidências de segurança e relatórios de conformidade | Endpoint `/audit/compliance-report` | ✅ |
| 8.8 | Acesso segregado por perfil | RBAC + row-level security (RLS) no PostgreSQL | ✅ |
| 8.9 | Controle de consentimento (quando aplicável) | Tabela `user_consents` + opt-in/opt-out | ✅ |

### 9. Suporte e Manutenção

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 9.1 | Sistema de chamados (tickets) | `backend/modules/suporte` + UI de tickets | ✅ |
| 9.2 | Canais: telefone, e-mail | Documentado em README + UI de contato | ✅ |
| 9.3 | Classificação de chamados (prioridade, categoria) | Campos `priority`, `category` em `support_tickets` | ✅ |
| 9.4 | SLA interno de atendimento | Cálculo automático + alertas | ✅ |
| 9.5 | Histórico de chamados | Tabela `support_ticket_messages` | ✅ |
| 9.6 | Base de conhecimento / FAQ | Tabela `knowledge_base` (opcional) | 🟡 |

### 10. Operação e Disponibilidade

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 10.1 | Disponibilidade mínima: 99,5% | Multi-AZ + auto-scaling + monitoring | ✅ |
| 10.2 | Backups automáticos diários | Automated RDS snapshots + S3 lifecycle | ✅ |
| 10.3 | Restore de backups testado | Script `restore.sh` + runbook | ✅ |
| 10.4 | Redundância de componentes críticos | Multi-AZ RDS + ECS/EKS com réplicas | ✅ |
| 10.5 | Monitoramento 24/7 | Prometheus + Grafana + Alertmanager | ✅ |
| 10.6 | Health checks e readiness probes | Endpoints `/health` e `/readiness` | ✅ |
| 10.7 | Incident response e escalation | Runbook + integração PagerDuty | ✅ |
| 10.8 | Disaster recovery (DR) | RTO < 4h, RPO < 1h | ✅ |

### 11. Capacitação e Documentação

| # | Requisito | Módulo/Componente | Status |
|---|-----------|-------------------|--------|
| 11.1 | Documentação de administração | `docs/` + guides | ✅ |
| 11.2 | Documentação de usuário final | Manual em PDF + vídeos (a produzir) | 🟡 |
| 11.3 | Roteiro de capacitação para servidores | `docs/09-IMPLANTACAO.md` + slides | ✅ |
| 11.4 | Treinamento prático (hands-on) | Ambiente de sandbox + exercícios | 🟡 |

---

## 📊 Resumo de Aderência

| Categoria | Total Requisitos | Implementados | Pendentes | % Aderência |
|-----------|------------------|---------------|-----------|-------------|
| Mapeamento GIS | 8 | 8 | 0 | **100%** |
| Recadastramento | 8 | 8 | 0 | **100%** |
| Endereçamento Digital | 6 | 6 | 0 | **100%** |
| Privacidade Diferencial | 7 | 7 | 0 | **100%** |
| Integração | 7 | 7 | 0 | **100%** |
| Dashboards | 6 | 6 | 0 | **100%** |
| Auth/RBAC | 6 | 6 | 0 | **100%** |
| LGPD/Segurança | 9 | 9 | 0 | **100%** |
| Suporte | 6 | 5 | 1 | **83%** |
| Operação/SLA | 8 | 8 | 0 | **100%** |
| Capacitação | 4 | 2 | 2 | **50%** |
| **TOTAL** | **75** | **72** | **3** | **96%** |

### Legenda
- ✅ Implementado
- 🟡 Parcialmente implementado / A implementar
- ❌ Não implementado

### Observações
Os 3 requisitos pendentes (Base de conhecimento + Documentação de usuário final + Treinamento prático) são complementares e serão finalizados na fase de implantação e operação assistida.

---

## 🔗 Mapeamento Requisito → Código

### Exemplo: Requisito 1.1 (Visualização de mapa interativo)

**Frontend**:
- Arquivo: `frontend/src/pages/MapaGIS.tsx`
- Componente: `<MapComponent />` usando Leaflet
- Rota: `/mapa`

**Backend**:
- Controller: `backend/src/modules/gis/gis.controller.ts`
- Service: `backend/src/modules/gis/gis.service.ts`
- Endpoint: `GET /gis/layers`, `GET /gis/features?layer=:layer`

**Banco de Dados**:
- Tabela: `gis_layers` (configuração de camadas)
- Tabela: `gis_features` (geometrias com PostGIS `geometry` column)
- View: `v_property_features` (join properties + geometries)

**Testes**:
- Unit: `backend/src/modules/gis/gis.service.spec.ts`
- E2E: `tests/e2e/gis/map-visualization.spec.ts`

---

## 📝 Próximos Passos para Validação

1. **Revisão com stakeholders**: Apresentar este checklist para validação conjunta
2. **Testes de aceite**: Executar casos de teste documentados em `docs/11-VALIDACAO-ADERENCIA.md`
3. **Prova de conceito (PoC)**: Demonstrar funcionalidades críticas (GIS + DP + Integração)
4. **Auditoria de segurança**: Contratar terceiro para pentest e revisão LGPD
5. **Homologação**: Ambiente de homologação com dados anonimizados para testes

---

**Última revisão**: 23/12/2025
