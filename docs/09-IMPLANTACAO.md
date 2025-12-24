# Guia de Implantação

## 📅 Cronograma de Implantação

### Fase 1: Preparação (Semanas 1-2)

| Atividade | Responsável | Duração | Entregável |
|-----------|-------------|---------|------------|
| Kickoff Meeting | Equipe + Prefeitura | 1 dia | Ata de reunião |
| Levantamento de Requisitos Detalhados | Analista de Negócios | 3 dias | Documento de requisitos |
| Configuração de Infraestrutura (Staging) | DevOps | 5 dias | Ambiente de homologação |
| Preparação de Dados de Teste | DBA | 3 dias | Base de dados anonimizada |
| Treinamento da Equipe Técnica | Instrutor | 2 dias | Certificados de participação |

---

### Fase 2: Homologação (Semanas 3-4)

| Atividade | Responsável | Duração | Entregável |
|-----------|-------------|---------|------------|
| Deploy em Staging | DevOps | 1 dia | Aplicação no ar |
| Importação de Dados de Teste | Operador | 2 dias | 10k imóveis importados |
| Testes Funcionais | QA + Prefeitura | 5 dias | Relatório de testes |
| Correção de Bugs Críticos | Desenvolvedores | 3 dias | Bugs resolvidos |
| Validação de Conformidade LGPD | Jurídico + DPO | 2 dias | Parecer jurídico |

---

### Fase 3: Produção (Semana 5)

| Atividade | Responsável | Duração | Entregável |
|-----------|-------------|---------|------------|
| Configuração de Infraestrutura (Produção) | DevOps | 2 dias | Ambiente de produção |
| Deploy em Produção | DevOps | 1 dia | Aplicação no ar |
| Migração de Dados Reais | DBA + Prefeitura | 2 dias | Base de dados completa |
| Testes de Fumaça | QA | 1 dia | Checklist validado |
| Go-Live | Todos | 1 dia | Sistema em operação |

---

### Fase 4: Pós-Implantação (Semanas 6-8)

| Atividade | Responsável | Duração | Entregável |
|-----------|-------------|---------|------------|
| Operação Assistida | Suporte + DevOps | 15 dias | Sistema estável |
| Treinamento de Usuários Finais | Instrutor | 5 dias | 50+ usuários treinados |
| Ajustes Finos | Desenvolvedores | 5 dias | Melhorias implementadas |
| Monitoramento Intensivo | DevOps | 15 dias | Relatório de performance |
| Reunião de Encerramento | Todos | 1 dia | Termo de aceite |

---

## 🎓 Plano de Capacitação

### 1. Público-Alvo

| Perfil | Quantidade | Carga Horária | Modalidade |
|--------|------------|---------------|------------|
| **Administradores de Sistema** | 2-3 | 16h | Presencial |
| **Operadores de Cadastro** | 20-30 | 12h | Híbrido |
| **Auditores e Fiscais** | 10-15 | 8h | Presencial |
| **Gestores e Tomadores de Decisão** | 5-10 | 4h | Presencial |
| **Suporte Técnico** | 3-5 | 20h | Presencial |

---

### 2. Conteúdo Programático

#### 2.1. Administradores de Sistema (16h)

**Dia 1 (8h)**:
- Arquitetura do sistema
- Configuração de infraestrutura (AWS, Docker, PostgreSQL)
- Gestão de usuários e permissões (RBAC)
- Backup e restore
- Monitoramento (Grafana, CloudWatch)

**Dia 2 (8h)**:
- Troubleshooting avançado
- Otimização de performance
- Segurança e LGPD (auditoria, logs)
- Procedimentos de emergência (runbook)
- **Lab prático**: Simular incidente e recuperação

---

#### 2.2. Operadores de Cadastro (12h)

**Dia 1 (4h)**:
- Introdução ao sistema
- Login e navegação
- Cadastro de imóveis (formulário completo)
- Busca e filtros
- **Lab prático**: Cadastrar 10 imóveis

**Dia 2 (4h)**:
- Endereçamento digital
- Geocodificação
- Upload de fotos e documentos
- Histórico de alterações
- **Lab prático**: Vincular endereços a imóveis

**Dia 3 (4h)**:
- Mapa GIS (visualização, camadas)
- Importação de dados (CSV, Excel)
- Exportação e relatórios
- Suporte: Abertura de tickets
- **Lab prático**: Importar 100 imóveis via CSV

---

#### 2.3. Auditores e Fiscais (8h)

**Dia 1 (4h)**:
- Consulta de imóveis
- Filtros avançados
- Visualização no mapa
- Dashboards e KPIs
- **Lab prático**: Identificar imóveis irregulares

**Dia 2 (4h)**:
- Auditoria: Logs de ações
- Verificação de integridade (hash chain)
- Relatórios de conformidade LGPD
- Exportação de dados para fiscalização
- **Lab prático**: Gerar relatório de auditoria

---

#### 2.4. Gestores (4h)

**Conteúdo**:
- Visão geral do sistema
- Dashboards executivos
- KPIs de recadastramento
- Relatórios estratégicos (PDF)
- Portal de dados abertos (LAI)
- **Demo**: Navegação guiada

---

#### 2.5. Suporte Técnico (20h)

**Semana 1 (16h)**:
- Arquitetura técnica
- Backend (NestJS, APIs)
- Frontend (React, componentes)
- Banco de dados (PostgreSQL, PostGIS)
- Autenticação e autorização

**Semana 2 (4h)**:
- Atendimento ao usuário
- Diagnóstico de problemas comuns
- Escalação de incidentes
- Documentação de chamados
- **Lab prático**: Resolver 10 casos reais

---

### 3. Material Didático

- **Manual do Usuário** (PDF, 80 páginas)
  - Capturas de tela
  - Passo-a-passo ilustrado
  - FAQ (30+ perguntas)

- **Vídeos Tutoriais** (YouTube privado)
  - Cadastro de imóvel (5 min)
  - Importação de dados (8 min)
  - Uso do mapa GIS (10 min)
  - Abertura de ticket (3 min)

- **Guia de Referência Rápida** (1 página, A4)
  - Comandos principais
  - Atalhos de teclado
  - Contatos de suporte

- **Ambiente de Treino** (staging.salesopolis.gov.br)
  - Dados fictícios
  - Usuários de teste
  - Reset diário

---

### 4. Avaliação de Aprendizado

**Método**: Quiz online + Prática supervisionada

**Critérios de Aprovação**:
- Quiz: Mínimo 70% de acertos
- Prática: Completar 5 tarefas sem assistência

**Certificado**: Emitido para participantes aprovados

---

## 🔧 Configuração Inicial

### 1. Checklist Pré-Implantação

- [ ] **Infraestrutura**
  - [ ] Conta AWS criada e configurada
  - [ ] VPC, Subnets, Security Groups criados
  - [ ] RDS PostgreSQL provisionado
  - [ ] ElastiCache Redis provisionado
  - [ ] S3 buckets criados (uploads, backups)
  - [ ] CloudFront distribuição criada
  - [ ] Route 53 DNS configurado
  - [ ] Certificado SSL/TLS emitido (ACM)

- [ ] **Aplicação**
  - [ ] Docker images buildadas e enviadas para ECR
  - [ ] ECS tasks definidas (backend, workers)
  - [ ] Variáveis de ambiente configuradas (Secrets Manager)
  - [ ] Migrations aplicadas no banco
  - [ ] Seeds de dados iniciais executados (roles, permissões)

- [ ] **Segurança**
  - [ ] Firewall (Security Groups) configurado
  - [ ] WAF rules criadas (proteção DDoS, SQL injection)
  - [ ] IAM roles e policies configuradas (least privilege)
  - [ ] Secrets rotacionados (senhas, chaves)
  - [ ] Auditoria ativada (CloudTrail)

- [ ] **Monitoramento**
  - [ ] CloudWatch dashboards criados
  - [ ] Alarmes configurados (CPU, memória, erros)
  - [ ] Grafana datasources conectados
  - [ ] Uptime Robot configurado (pings a cada 5 min)
  - [ ] PagerDuty integrado

- [ ] **Backup**
  - [ ] RDS automated backups ativados (retenção: 30 dias)
  - [ ] Snapshots manuais criados
  - [ ] Script de backup de arquivos S3
  - [ ] Teste de restore executado

---

### 2. Migração de Dados

#### 2.1. Extração de Dados Legados

**Origem**: Sistema atual da prefeitura (acessar via SQL ou exportação)

**Passos**:
1. Identificar tabelas relevantes (imóveis, proprietários, endereços)
2. Mapear campos (sistema antigo → sistema novo)
3. Exportar para CSV/JSON
4. Anonimizar dados sensíveis (se for staging)

**Exemplo de Exportação**:
```sql
-- Sistema legado (Oracle/SQL Server/MySQL)
SELECT 
  codigo_iptu,
  tipo_imovel,
  area_terreno_m2,
  nome_proprietario,
  cpf_proprietario,
  logradouro,
  numero,
  bairro,
  cep
FROM cadastro_imoveis
WHERE situacao = 'ATIVO'
```

Salvar como `imoveis_export.csv`.

---

#### 2.2. Transformação de Dados

**Ferramenta**: Script Python + Pandas

```python
import pandas as pd

# Carregar CSV
df = pd.read_csv('imoveis_export.csv', encoding='latin1', sep=';')

# Transformações
df['type'] = df['tipo_imovel'].map({
    'RES': 'RESIDENTIAL',
    'COM': 'COMMERCIAL',
    'IND': 'INDUSTRIAL'
})

df['ownerDocument'] = df['cpf_proprietario'].str.replace('[^0-9]', '', regex=True)

# Validações
df = df[df['ownerDocument'].str.len() == 11]  # CPF válido
df = df[df['area_terreno_m2'] > 0]

# Salvar CSV limpo
df.to_csv('imoveis_clean.csv', index=False, encoding='utf-8')
```

---

#### 2.3. Importação para o Sistema Novo

```bash
# Upload via API
curl -X POST http://app.salesopolis.gov.br/api/integracao/import \
  -H "Authorization: Bearer <admin-token>" \
  -F "file=@imoveis_clean.csv" \
  -F "entity=properties" \
  -F "mappingId=<mapping-uuid>"

# Acompanhar status
curl http://app.salesopolis.gov.br/api/integracao/jobs/<job-id> \
  -H "Authorization: Bearer <admin-token>"
```

**Validação**:
- Comparar total de registros (sistema antigo vs. novo)
- Amostrar 100 imóveis aleatórios e validar manualmente
- Executar queries de checagem:
  ```sql
  -- Total por tipo
  SELECT type, COUNT(*) FROM properties GROUP BY type;
  
  -- Imóveis sem endereço
  SELECT COUNT(*) FROM properties WHERE digital_address_id IS NULL;
  ```

---

### 3. Configuração de Usuários e Permissões

#### 3.1. Criar Perfis (Roles)

```sql
-- Admin (acesso total)
INSERT INTO roles (id, name, description) VALUES 
('admin-role-id', 'ADMIN', 'Administrador do sistema');

-- Operador (leitura + escrita)
INSERT INTO roles (id, name, description) VALUES 
('operator-role-id', 'OPERATOR', 'Operador de cadastro');

-- Auditor (somente leitura)
INSERT INTO roles (id, name, description) VALUES 
('auditor-role-id', 'AUDITOR', 'Auditor fiscal');
```

#### 3.2. Atribuir Permissões

```sql
-- Admin: todas as permissões
INSERT INTO role_permissions (role_id, permission) VALUES 
('admin-role-id', 'properties:read'),
('admin-role-id', 'properties:write'),
('admin-role-id', 'properties:delete'),
('admin-role-id', 'users:manage'),
('admin-role-id', 'audit:read');

-- Operator: leitura + escrita (sem delete)
INSERT INTO role_permissions (role_id, permission) VALUES 
('operator-role-id', 'properties:read'),
('operator-role-id', 'properties:write'),
('operator-role-id', 'addresses:write');

-- Auditor: somente leitura
INSERT INTO role_permissions (role_id, permission) VALUES 
('auditor-role-id', 'properties:read'),
('auditor-role-id', 'dashboard:read'),
('auditor-role-id', 'audit:read');
```

#### 3.3. Criar Usuários Iniciais

```sql
-- Usuário admin
INSERT INTO users (id, name, email, password_hash, role_id) VALUES 
('admin-user-id', 'Administrador', 'admin@salesopolis.sp.gov.br', '<bcrypt-hash>', 'admin-role-id');

-- Usuários da prefeitura (importar de planilha)
-- Ver script em /scripts/import_users.ts
```

---

### 4. Testes de Aceite

**Responsável**: Equipe da prefeitura + QA

**Checklist**: Ver [11-VALIDACAO-ADERENCIA.md](11-VALIDACAO-ADERENCIA.md)

**Critério de Aprovação**: 95% dos testes passando (máximo 1-2 bugs não-críticos)

**Prazo**: 5 dias úteis

---

### 5. Go-Live

**Data**: Definida com a prefeitura (preferencialmente segunda-feira às 8h)

**Checklist**:
- [ ] Todos os testes de aceite aprovados
- [ ] Backup completo realizado
- [ ] Monitoramento ativo e validado
- [ ] Equipe de suporte escalada (plantão 24h primeiros 3 dias)
- [ ] Comunicação enviada aos usuários (email + portal)
- [ ] Plano de rollback preparado

**Comunicação aos Usuários**:
```
Assunto: Sistema de Cadastro Georreferenciado - Novo Sistema no Ar

Prezados servidores,

Informamos que o novo Sistema de Cadastro Georreferenciado está disponível a partir de hoje, 01/01/2025.

Acesso: https://app.salesopolis.gov.br
Credenciais: Enviadas por email individual

Em caso de dúvidas, contate o suporte:
- Email: suporte@salesopolis.sp.gov.br
- Telefone: (11) 4000-0000
- Ramal: 1234

Atenciosamente,
Secretaria de Tecnologia da Informação
```

---

### 6. Operação Assistida

**Duração**: 15 dias

**Equipe**:
- 2 DevOps (on-call 24h)
- 2 Desenvolvedores (horário comercial)
- 1 DBA (on-call)
- 2 Analistas de suporte (horário comercial)

**Atividades**:
- Monitoramento contínuo de métricas
- Atendimento prioritário a tickets
- Resolução rápida de bugs críticos
- Treinamento adicional sob demanda
- Reuniões diárias de status (daily standup)

---

### 7. Encerramento e Transição

**Reunião Final** (após 15 dias de operação assistida):
- Apresentação de métricas (uptime, performance, uso)
- Lições aprendidas
- Melhorias identificadas
- Assinatura do Termo de Aceite

**Termo de Aceite** (modelo):
```
Termo de Aceite Definitivo

Projeto: Sistema de Cadastro Georreferenciado
Contratante: Prefeitura da Estância Turística de Salesópolis
Contratada: [Empresa fornecedora]

Declaramos que o sistema foi implantado conforme especificado no Edital Pregão Eletrônico nº 16/2025 e está em plena operação desde [DATA].

Foram realizados testes de aceite conforme checklist anexo, com 100% de aprovação.

O sistema atende aos requisitos de:
- Funcionalidade: Sim
- Performance: Sim (SLA 99.5% atingido)
- Segurança: Sim (OWASP Top 10, LGPD)
- Usabilidade: Sim

Aprovamos a implantação e autorizamos o pagamento integral conforme contrato.

Salesópolis, [DATA]

_______________________________
[Nome do Gestor]
Secretário de Tecnologia da Informação

_______________________________
[Nome do Fornecedor]
Representante da Empresa
```

---

## 📚 Documentação Entregue

- [x] README.md (visão geral)
- [x] 01-REQUISITOS.md (checklist de 75 itens)
- [x] 02-ARQUITETURA.md (diagramas, ADRs)
- [x] 03-MODELAGEM-DADOS.md (ERD, DDL)
- [x] 04-API-SPEC.md (50+ endpoints)
- [x] 05-SEGURANCA-LGPD.md (compliance)
- [x] 06-PRIVACIDADE-DIFERENCIAL.md (algoritmos DP)
- [x] 07-INTEGRACAO.md (import/export)
- [x] 08-OPERACAO.md (deploy, monitoramento)
- [x] 09-IMPLANTACAO.md (este documento)
- [x] 10-ASSUNCOES.md (premissas controladas)
- [x] 11-VALIDACAO-ADERENCIA.md (testes de aceite)
- [x] Manual do Usuário (PDF, separado)
- [x] Código-fonte completo (backend + frontend)

---

**Última atualização**: 23/12/2025
