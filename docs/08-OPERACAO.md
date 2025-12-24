# Guia de Operação

## 🚀 Deploy e Infraestrutura

### 1. Ambientes

| Ambiente | Finalidade | URL | Dados |
|----------|-----------|-----|-------|
| **Desenvolvimento** | Testes locais | localhost:3000 | Mock/Seed |
| **Staging** | Homologação | staging.salesopolis.gov.br | Dados de teste (anonimizados) |
| **Produção** | Uso real | app.salesopolis.gov.br | Dados reais |

---

### 2. Deploy em Produção (AWS)

#### 2.1. Pré-requisitos
- Conta AWS configurada
- Terraform instalado (v1.6+)
- AWS CLI configurado
- Kubectl instalado (se usar EKS)

#### 2.2. Deploy Backend (ECS Fargate)

```bash
# 1. Build da imagem Docker
cd backend
docker build -t salesopolis-backend:latest .

# 2. Push para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag salesopolis-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/salesopolis-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/salesopolis-backend:latest

# 3. Deploy via Terraform
cd ../terraform
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

#### 2.3. Deploy Frontend (S3 + CloudFront)

```bash
cd frontend
npm run build

# Upload para S3
aws s3 sync dist/ s3://salesopolis-frontend-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234567890ABC --paths "/*"
```

---

### 3. Banco de Dados (RDS PostgreSQL)

#### 3.1. Migrations

```bash
# Produção (com cautela!)
cd backend
npm run migration:run

# Reverter última migration (emergência)
npm run migration:revert
```

#### 3.2. Backup Manual

```bash
# Backup completo
pg_dump -h <rds-endpoint> -U postgres -d salesopolis > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas schema
pg_dump -h <rds-endpoint> -U postgres -d salesopolis --schema-only > schema.sql

# Backup de tabela específica
pg_dump -h <rds-endpoint> -U postgres -d salesopolis -t properties > properties_backup.sql
```

#### 3.3. Restore

```bash
# Restaurar backup completo
psql -h <rds-endpoint> -U postgres -d salesopolis < backup_20251223_120000.sql

# Restaurar tabela específica (cuidado: apaga dados existentes)
psql -h <rds-endpoint> -U postgres -d salesopolis < properties_backup.sql
```

#### 3.4. Backups Automáticos (RDS)

- **Frequência**: Diário, às 3:00 AM (horário de Brasília)
- **Retenção**: 30 dias
- **Snapshots**: Mantidos por 90 dias
- **Recovery Point Objective (RPO)**: 24 horas
- **Recovery Time Objective (RTO)**: 4 horas

**Restaurar snapshot**:
```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier salesopolis-prod-restored \
  --db-snapshot-identifier rds:salesopolis-prod-2025-12-23-03-00
```

---

### 4. Monitoramento

#### 4.1. Métricas do Sistema (CloudWatch)

**Backend (ECS/Fargate)**:
- CPU Utilization (alerta se > 80%)
- Memory Utilization (alerta se > 85%)
- Request Count
- Response Time (p50, p95, p99)
- Error Rate (alerta se > 1%)

**Banco de Dados (RDS)**:
- DB Connections (alerta se > 90% do máximo)
- Free Storage Space (alerta se < 10 GB)
- Read/Write Latency
- Database Connections

**Frontend (CloudFront)**:
- Request Count
- Cache Hit Rate (meta: > 80%)
- 4xx/5xx Error Rate

#### 4.2. Dashboards (Grafana)

**URL**: https://monitoring.salesopolis.gov.br

**Dashboards**:
1. **Visão Geral**: KPIs principais, uptime, requests/s
2. **Backend**: Latência por endpoint, taxas de erro, filas
3. **Banco de Dados**: Queries lentas, locks, tamanho de tabelas
4. **Infraestrutura**: CPU, memória, disco, rede

#### 4.3. Logs (CloudWatch Logs)

**Grupos de Log**:
- `/ecs/salesopolis-backend`
- `/rds/salesopolis-prod`
- `/lambda/salesopolis-jobs`

**Buscar erro específico**:
```bash
aws logs filter-log-events \
  --log-group-name /ecs/salesopolis-backend \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000
```

#### 4.4. Alertas

**Configurados no CloudWatch Alarms**:
| Alerta | Condição | Ação |
|--------|----------|------|
| High CPU | CPU > 80% por 5 min | Email + SMS para DevOps |
| High Memory | Memory > 85% por 5 min | Email + Auto-scaling |
| High Error Rate | Erros 5xx > 1% por 3 min | Email + PagerDuty |
| DB Connections | Conexões > 90 por 5 min | Email + investigação |
| Disk Space Low | Storage < 10 GB | Email URGENTE + expand |
| Health Check Failed | 3 falhas consecutivas | Email + restart task |

**Destinatários**:
- Email: devops@salesopolis.gov.br
- SMS: +55 11 9XXXX-XXXX (DevOps on-call)
- PagerDuty: Equipe de plantão

---

### 5. Manutenção

#### 5.1. Atualização de Dependências

```bash
# Backend
cd backend
npm audit
npm audit fix
npm outdated
npm update

# Frontend
cd frontend
npm audit
npm audit fix
npm update
```

**Frequência**: Mensal (ou imediatamente se vulnerabilidade crítica).

#### 5.2. Limpeza de Dados

**Job Agendado** (CloudWatch Events → Lambda):
- **Logs antigos**: Deletar logs > 90 dias
- **Arquivos temporários**: Limpar S3 `/temp` > 7 dias
- **Sessões expiradas**: Deletar tokens > 30 dias
- **Jobs completos**: Arquivar jobs > 60 dias

#### 5.3. Otimização de Banco de Dados

```sql
-- Análise de tabelas (mensal)
ANALYZE properties;
ANALYZE gis_features;
ANALYZE audit_log;

-- Vacuum (recuperar espaço, mensal)
VACUUM ANALYZE;

-- Reindex (semestral, em janela de manutenção)
REINDEX DATABASE salesopolis;

-- Queries lentas (investigar diariamente)
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

#### 5.4. Janela de Manutenção

**Agendamento**: Primeiro domingo de cada mês, 2:00 AM - 6:00 AM

**Atividades**:
1. Backup completo
2. Aplicação de patches de segurança
3. Vacuum/Reindex
4. Atualização de certificados SSL (se necessário)
5. Testes de disaster recovery

**Comunicação**: Aviso no portal 48h antes.

---

### 6. Recuperação de Desastres

#### 6.1. Cenário 1: Banco de Dados Corrompido

**Ações**:
1. Identificar último backup válido
2. Provisionar nova instância RDS
3. Restaurar backup
4. Atualizar endpoint no backend (variável de ambiente)
5. Aplicar transações do log (Point-in-Time Recovery)
6. Validar dados críticos
7. Redirecionar tráfego

**Tempo estimado**: 2-4 horas

#### 6.2. Cenário 2: Região AWS Indisponível

**Ações**:
1. Ativar região secundária (us-west-2)
2. Atualizar DNS (Route 53) para novo ALB
3. Sincronizar dados (se replicação estava ativa)
4. Validar aplicação
5. Notificar usuários

**Tempo estimado**: 30-60 minutos (se DR configurado)

#### 6.3. Cenário 3: Ataque DDoS

**Ações**:
1. Ativar AWS Shield Advanced
2. Configurar regras WAF (bloqueio de IPs suspeitos)
3. Escalar capacidade (Auto-scaling)
4. Ativar rate limiting mais agressivo
5. Monitorar métricas em tempo real

**Tempo estimado**: 10-30 minutos

---

### 7. Segurança Operacional

#### 7.1. Rotação de Credenciais

**Frequência**: Trimestral

**Itens**:
- Senha do banco de dados (RDS)
- Chaves de API (Nominatim, outros serviços)
- Secrets (JWT_SECRET, ENCRYPTION_KEY)
- Certificados SSL/TLS

**Processo**:
```bash
# 1. Gerar nova senha segura
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Atualizar no AWS Secrets Manager
aws secretsmanager update-secret \
  --secret-id salesopolis/prod/db-password \
  --secret-string "$NEW_PASSWORD"

# 3. Atualizar senha no RDS
aws rds modify-db-instance \
  --db-instance-identifier salesopolis-prod \
  --master-user-password "$NEW_PASSWORD" \
  --apply-immediately

# 4. Reiniciar aplicação (para recarregar secrets)
aws ecs update-service \
  --cluster salesopolis-prod \
  --service backend \
  --force-new-deployment
```

#### 7.2. Auditoria de Acessos

**Mensal**: Revisar logs de acesso privilegiado
```sql
SELECT user_id, action, entity_type, timestamp
FROM audit_log
WHERE user_id IN (SELECT id FROM users WHERE role_id = 'admin')
AND timestamp > NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;
```

#### 7.3. Scan de Vulnerabilidades

**Semanal**: Executar Trivy no Docker image
```bash
trivy image <account-id>.dkr.ecr.us-east-1.amazonaws.com/salesopolis-backend:latest
```

**Mensal**: Executar Nessus/OpenVAS na infraestrutura

---

### 8. Escalabilidade

#### 8.1. Auto-scaling (ECS)

**Configuração**:
- **Mínimo**: 2 tasks
- **Máximo**: 10 tasks
- **Métrica**: CPU > 70% por 3 min → +1 task
- **Cooldown**: 5 min

#### 8.2. Escalabilidade do Banco de Dados

**Read Replicas**:
- 2 replicas para leitura (queries analíticas, dashboards)
- Load balancing via PgBouncer
- Lag máximo aceitável: 5 segundos

**Vertical Scaling**:
- Se CPU > 80% persistente → upgrade de instância (db.r6g.xlarge → db.r6g.2xlarge)

#### 8.3. Cache (ElastiCache Redis)

**Configuração**:
- Cluster: 3 nós (1 primary, 2 replicas)
- Eviction policy: LRU (Least Recently Used)
- TTL padrão: 1 hora

**Cache Keys**:
- `dashboard:kpis` (TTL: 15 min)
- `properties:list:{filters}` (TTL: 5 min)
- `user:permissions:{userId}` (TTL: 1 hora)

---

### 9. SLA (Service Level Agreement)

**Meta**: 99.5% de uptime mensal

**Cálculo**:
```
Uptime = (Total Time - Downtime) / Total Time * 100

Mês = 30 dias = 43200 minutos
Downtime máximo permitido = 43200 * 0.005 = 216 minutos = 3h36min
```

**Tracking**:
- Uptime Robot (ping a cada 5 min)
- Relatório mensal automático
- Compensação: Crédito de 10% do valor mensal se SLA não for cumprido

---

### 10. Runbook (Procedimentos Comuns)

#### 10.1. Aplicação Lenta

**Sintoma**: Latência > 2s em endpoints

**Diagnóstico**:
1. Verificar CPU/Memory no CloudWatch
2. Verificar queries lentas no banco
3. Verificar conexões no pool

**Ações**:
- Se CPU alto → Escalar tasks
- Se queries lentas → Adicionar índices, otimizar SQL
- Se conexões esgotadas → Aumentar pool size

#### 10.2. Erro 500 em Massa

**Sintoma**: Taxa de erro 5xx > 5%

**Diagnóstico**:
1. Verificar logs do backend
2. Verificar saúde do banco de dados
3. Verificar filas (Redis/Bull)

**Ações**:
- Se banco fora do ar → Ativar read replica como primary (failover)
- Se Redis fora → Reiniciar cluster
- Se bug no código → Rollback para versão anterior

#### 10.3. Disco Cheio

**Sintoma**: Alerta "Free Storage Space < 10 GB"

**Ações**:
1. Identificar tabelas grandes: `SELECT pg_size_pretty(pg_total_relation_size('table_name'));`
2. Executar VACUUM FULL (libera espaço)
3. Arquivar dados antigos (logs > 90 dias)
4. Expandir storage (RDS) se necessário

---

## 📞 Contatos de Emergência

| Função | Nome | Telefone | Email |
|--------|------|----------|-------|
| DevOps Lead | João Silva | +55 11 9XXXX-1111 | joao@devops.com |
| DBA | Maria Santos | +55 11 9XXXX-2222 | maria@devops.com |
| Segurança | Carlos Souza | +55 11 9XXXX-3333 | carlos@devops.com |
| Gestor TI Prefeitura | Ana Costa | +55 11 9XXXX-4444 | ana.costa@salesopolis.sp.gov.br |

---

**Última atualização**: 23/12/2025
