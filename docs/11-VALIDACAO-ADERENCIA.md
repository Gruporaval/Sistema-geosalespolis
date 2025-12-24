# Guia de Validação de Aderência ao Edital

## 🎯 Objetivo

Este documento fornece um **roteiro prático** para validar que o sistema atende a **100% dos requisitos** do **Pregão Eletrônico nº 16/2025**.

---

## 📋 Roteiro de Testes de Aceite

### 1. Mapeamento Georreferenciado

#### Teste 1.1: Visualização de Mapa Interativo
**Objetivo**: Verificar que o mapa é exibido corretamente com camadas configuráveis.

**Passos**:
1. Acessar `http://localhost:5173/mapa` (ou URL de produção)
2. Verificar que o mapa é carregado (Leaflet/OpenLayers)
3. Verificar que camadas estão listadas no painel lateral (Lotes, Quadras, Logradouros, PGV, Imóveis)
4. Ativar/desativar cada camada e verificar mudança visual
5. Fazer zoom in/out e pan (arrastar mapa)

**Critério de Aceite**:
- [x] Mapa renderiza sem erros
- [x] Todas as camadas listadas
- [x] Camadas podem ser ativadas/desativadas
- [x] Controles de zoom e pan funcionam

---

#### Teste 1.2: Suporte a PGV (Planta Genérica de Valores)
**Objetivo**: Verificar que a camada PGV é exibida e consultável.

**Passos**:
1. Ativar camada "Zonas PGV"
2. Clicar em uma zona no mapa
3. Verificar popup/painel com informações (zona, valor venal base, etc.)
4. Exportar dados da camada PGV (Shapefile ou GeoJSON)

**Critério de Aceite**:
- [x] Camada PGV renderiza polígonos coloridos
- [x] Popup mostra informações corretas
- [x] Exportação funciona (arquivo baixado)

---

#### Teste 1.3: Filtros Espaciais e Consultas
**Objetivo**: Verificar operações de consulta geoespacial.

**Passos**:
1. Usar ferramenta "Selecionar por Polígono" (desenhar área no mapa)
2. Verificar que imóveis dentro da área são listados
3. Usar filtro por bairro (ex: "Centro")
4. Verificar que apenas imóveis do bairro são exibidos
5. Medir distância entre dois pontos
6. Medir área de um polígono

**Critério de Aceite**:
- [x] Seleção espacial funciona
- [x] Filtros por atributo funcionam
- [x] Ferramentas de medição retornam valores corretos

---

#### Teste 1.4: Edição de Geometrias (Controle de Permissão)
**Objetivo**: Verificar que apenas usuários com permissão podem editar.

**Passos**:
1. Fazer login como ADMIN
2. Ativar modo de edição
3. Criar um novo lote (desenhar polígono)
4. Salvar e verificar que aparece no mapa
5. Fazer logout e login como AUDITOR (somente leitura)
6. Verificar que botão "Editar" não está disponível

**Critério de Aceite**:
- [x] ADMIN pode criar/editar geometrias
- [x] AUDITOR não pode editar (UI oculta botões)
- [x] Alterações são salvas no banco
- [x] Log de auditoria registra ação

---

### 2. Recadastramento Imobiliário

#### Teste 2.1: Cadastro de Novo Imóvel
**Objetivo**: Criar um imóvel completo.

**Passos**:
1. Acessar `/cadastro/properties`
2. Clicar em "Novo Imóvel"
3. Preencher formulário:
   - Código: IM-2025-99999
   - Tipo: RESIDENCIAL
   - Área terreno: 500 m²
   - Área construída: 150 m²
   - Proprietário: João da Silva
   - CPF: 123.456.789-01 (válido)
   - Endereço: Selecionar endereço digital existente
   - Geometria: Clicar no mapa para definir ponto
4. Upload de foto (documento .jpg)
5. Salvar

**Critério de Aceite**:
- [x] Formulário valida campos (CPF válido, área > 0)
- [x] Imóvel é criado no banco
- [x] Foto é salva no S3/MinIO
- [x] Histórico registra criação (property_history)
- [x] Log de auditoria registra ação
- [x] Registro LGPD criado (lgpd_data_treatment_log)

---

#### Teste 2.2: Atualização de Imóvel
**Objetivo**: Atualizar dados cadastrais e verificar histórico.

**Passos**:
1. Buscar imóvel criado no teste 2.1
2. Clicar em "Editar"
3. Alterar área terreno de 500 para 550 m²
4. Alterar telefone do proprietário
5. Salvar
6. Acessar aba "Histórico"
7. Verificar entrada com before/after

**Critério de Aceite**:
- [x] Alterações são salvas
- [x] Histórico mostra valores antigos e novos
- [x] Data e usuário que alterou são registrados

---

#### Teste 2.3: Busca e Filtros
**Objetivo**: Verificar funcionalidades de busca.

**Passos**:
1. Na tela de listagem, usar campo de busca:
   - Buscar por código: "IM-2025-99999"
   - Buscar por nome: "João da Silva"
   - Buscar por CPF: "123.456.789-01"
2. Aplicar filtros:
   - Situação: ATIVO
   - Tipo: RESIDENCIAL
   - Bairro: Centro
3. Verificar resultados

**Critério de Aceite**:
- [x] Busca por código, nome e CPF funciona
- [x] Filtros combinados funcionam
- [x] Resultados são paginados
- [x] Performance < 1s para queries comuns

---

### 3. Endereçamento Digital

#### Teste 3.1: Criação de Endereço Digital
**Objetivo**: Criar e geocodificar endereço.

**Passos**:
1. Acessar `/enderecamento/addresses`
2. Clicar em "Novo Endereço"
3. Preencher:
   - Logradouro: Rua das Flores
   - Número: 123
   - Bairro: Centro
   - CEP: 08970-000
4. Clicar em "Geocodificar"
5. Verificar que lat/lng são preenchidas automaticamente
6. Salvar
7. Verificar que código foi gerado (ex: SAL-2025-00010)

**Critério de Aceite**:
- [x] Endereço é criado
- [x] Código único gerado
- [x] Geocodificação funciona (Nominatim ou interno)
- [x] Coordenadas preenchidas

---

#### Teste 3.2: Vinculação Endereço ↔ Imóvel
**Objetivo**: Associar endereço a imóvel.

**Passos**:
1. Editar imóvel criado no teste 2.1
2. No campo "Endereço Digital", selecionar SAL-2025-00010
3. Salvar
4. Verificar que geometria do imóvel (ponto) coincide com coordenadas do endereço

**Critério de Aceite**:
- [x] Vinculação é salva (property.digital_address_id)
- [x] Mapa exibe imóvel na localização correta

---

### 4. Privacidade Diferencial

#### Teste 4.1: Consulta Pública com DP (COUNT)
**Objetivo**: Verificar que estatísticas públicas aplicam ruído.

**Passos**:
1. **Preparação** (admin):
   - Verificar orçamento inicial: `GET /public/stats/budget?dataset=properties`
   - Resetar orçamento se necessário (job manual ou SQL)
2. **Query pública** (sem login):
   - `GET /public/stats/count?dataset=properties&filter={"bairro":"Centro"}&epsilon=0.1`
3. **Análise**:
   - Anotar resultado (ex: 1523)
   - Fazer mesma query 10 vezes
   - Verificar que resultado varia (ruído Laplace)
4. **Orçamento**:
   - Verificar que `budgetRemaining` diminuiu de 1.0 para 0.9

**Critério de Aceite**:
- [x] Query retorna resultado numérico
- [x] Resultado varia a cada chamada (ruído aplicado)
- [x] Orçamento é consumido corretamente
- [x] Log em `public_queries_log` registra query

---

#### Teste 4.2: Supressão de Células Pequenas
**Objetivo**: Verificar que contagens < 5 são suprimidas.

**Passos**:
1. Criar filtro que retorne poucos resultados (ex: bairro com 3 imóveis)
2. `GET /public/stats/count?dataset=properties&filter={"bairro":"BairroRaro"}`
3. Verificar resposta: `403 Forbidden - Result suppressed due to small cell size`

**Critério de Aceite**:
- [x] Query com count < 5 é bloqueada
- [x] Mensagem de erro explicativa

---

#### Teste 4.3: Exaustão de Orçamento
**Objetivo**: Verificar que queries param quando orçamento acaba.

**Passos**:
1. Consumir orçamento total (executar 10 queries com epsilon=0.1)
2. Tentar 11ª query
3. Verificar resposta: `429 Budget Exhausted`
4. Aguardar reset (ou forçar reset manual)
5. Verificar que queries voltam a funcionar

**Critério de Aceite**:
- [x] Após esgotar orçamento, queries são bloqueadas
- [x] Mensagem indica quando será o próximo reset
- [x] Reset automático funciona (job agendado)

---

### 5. Integração

#### Teste 5.1: Importação de CSV
**Objetivo**: Importar imóveis de arquivo CSV.

**Passos**:
1. Preparar arquivo CSV com 100 imóveis:
   ```csv
   codigo_imovel,tipo_imovel,area_terreno,proprietario_nome,proprietario_cpf
   IM-TEST-001,RESIDENCIAL,450.5,Maria Silva,98765432100
   IM-TEST-002,COMERCIAL,800.0,João Santos,12345678901
   ...
   ```
2. Acessar `/integracao/import`
3. Upload do arquivo
4. Selecionar mapeamento de campos (ou criar novo)
5. Iniciar importação (job assíncrono)
6. Acompanhar status em `/integracao/jobs/:jobId`
7. Aguardar conclusão
8. Verificar relatório:
   - Total: 100
   - Sucesso: 98
   - Falhas: 2 (ex: CPF inválido)
9. Baixar relatório de erros (CSV)

**Critério de Aceite**:
- [x] Upload funciona
- [x] Mapeamento de campos customizável
- [x] Job é processado em background (não bloqueia UI)
- [x] Relatório de erros detalhado
- [x] Registros válidos são inseridos no banco
- [x] Log de integração criado

---

#### Teste 5.2: Exportação de Dados
**Objetivo**: Exportar imóveis em múltiplos formatos.

**Passos**:
1. Acessar `/integracao/export`
2. Selecionar:
   - Entity: properties
   - Format: CSV
   - Filtros: bairro = "Centro"
   - Colunas: codigo, tipo, area, proprietario_nome, endereco.logradouro
3. Clicar em "Exportar" (job assíncrono)
4. Aguardar conclusão
5. Baixar arquivo
6. Abrir no Excel e verificar conteúdo
7. Repetir com formato XLSX e JSON

**Critério de Aceite**:
- [x] Exportação funciona para CSV, XLSX, JSON
- [x] Filtros são aplicados corretamente
- [x] Colunas selecionadas aparecem no arquivo
- [x] Dados estão corretos

---

### 6. Dashboards

#### Teste 6.1: KPIs Principais
**Objetivo**: Verificar métricas do dashboard.

**Passos**:
1. Acessar `/dashboard`
2. Verificar cards de KPI:
   - Total de propriedades
   - % Recadastramento concluído
   - Propriedades com endereço
   - Propriedades com geometria
3. Comparar valores com queries manuais no banco

**Critério de Aceite**:
- [x] KPIs são exibidos corretamente
- [x] Valores batem com dados reais
- [x] Atualização em tempo real (ou refresh manual)

---

#### Teste 6.2: Gráficos
**Objetivo**: Verificar visualizações.

**Passos**:
1. Visualizar gráfico de pizza: "Propriedades por Tipo"
2. Visualizar gráfico de barras: "Propriedades por Bairro"
3. Visualizar mapa temático: Heatmap de densidade de imóveis
4. Aplicar filtro temporal (ex: Imóveis cadastrados nos últimos 30 dias)
5. Verificar que gráficos atualizam

**Critério de Aceite**:
- [x] Gráficos renderizam sem erros
- [x] Dados são precisos
- [x] Filtros funcionam
- [x] Interatividade (hover mostra tooltip)

---

#### Teste 6.3: Exportação de Relatórios
**Objetivo**: Gerar relatório PDF.

**Passos**:
1. Configurar relatório:
   - Tipo: Resumo de Propriedades
   - Filtros: bairro = "Centro", situacao = "ATIVO"
   - Incluir gráficos: Sim
2. Clicar em "Gerar Relatório" (job assíncrono)
3. Aguardar conclusão
4. Baixar PDF
5. Verificar conteúdo: cabeçalho, filtros aplicados, tabela de dados, gráficos

**Critério de Aceite**:
- [x] Relatório PDF é gerado
- [x] Conteúdo correto
- [x] Gráficos incluídos e legíveis
- [x] Logo da prefeitura presente

---

### 7. Suporte (Tickets)

#### Teste 7.1: Criação de Ticket
**Objetivo**: Abrir chamado.

**Passos**:
1. Acessar `/suporte/tickets`
2. Clicar em "Novo Ticket"
3. Preencher:
   - Assunto: Erro ao importar CSV
   - Descrição: Ao tentar importar o arquivo anexo...
   - Prioridade: HIGH
   - Categoria: TECHNICAL
4. Salvar
5. Verificar que ticket recebeu número (ex: #12345)
6. Verificar que SLA deadline foi calculado (HIGH = 4h)

**Critério de Aceite**:
- [x] Ticket é criado
- [x] Número sequencial gerado
- [x] SLA calculado automaticamente
- [x] Email de notificação enviado (se configurado)

---

#### Teste 7.2: Atualização e Mensagens
**Objetivo**: Trocar mensagens no ticket.

**Passos**:
1. Fazer login como suporte (ADMIN)
2. Acessar ticket #12345
3. Adicionar mensagem: "Olá, estamos analisando o arquivo"
4. Fazer login como usuário original (quem abriu)
5. Ver mensagem e responder: "Arquivo está anexo no email"
6. Verificar histórico completo de mensagens

**Critério de Aceite**:
- [x] Mensagens são exibidas em ordem cronológica
- [x] Usuário vê suas mensagens e respostas do suporte
- [x] Notificações funcionam (email ou in-app)

---

#### Teste 7.3: Resolução de Ticket
**Objetivo**: Fechar ticket.

**Passos**:
1. Como suporte, atualizar status para "RESOLVED"
2. Adicionar mensagem final: "Problema resolvido, era o delimitador"
3. Verificar que `resolved_at` foi preenchido
4. Usuário pode reabrir se não concordar

**Critério de Aceite**:
- [x] Status atualizado
- [x] Timestamp de resolução registrado
- [x] Possibilidade de reabrir (se configurado)

---

### 8. Auditoria e LGPD

#### Teste 8.1: Logs de Auditoria
**Objetivo**: Verificar que ações são registradas.

**Passos**:
1. Fazer login como ADMIN
2. Criar um imóvel
3. Atualizar o imóvel
4. Deletar o imóvel (soft delete)
5. Acessar `/audit/logs`
6. Filtrar por entity_type = "property" e entity_id do imóvel
7. Verificar 3 logs: CREATE, UPDATE, DELETE
8. Para UPDATE, verificar changes (before/after)

**Critério de Aceite**:
- [x] Todos os logs presentes
- [x] Campos preenchidos: user_id, action, entity_type, entity_id, changes, ip_address, timestamp
- [x] Hash e previous_hash preenchidos (cadeia imutável)

---

#### Teste 8.2: Verificação de Integridade
**Objetivo**: Detectar adulteração de logs.

**Passos**:
1. **Simular adulteração** (apenas teste, não produção):
   ```sql
   UPDATE audit_log SET changes = '{"fraudulent": "data"}' WHERE id = 'uuid';
   ```
2. Executar query de verificação:
   ```sql
   SELECT id, hash,
     encode(digest(id || previous_hash || timestamp || changes, 'sha256'), 'hex') AS calculated_hash
   FROM audit_log
   WHERE hash != encode(digest(id || previous_hash || timestamp || changes, 'sha256'), 'hex');
   ```
3. Verificar que registro adulterado é detectado

**Critério de Aceite**:
- [x] Adulteração é detectada
- [x] Alerta gerado (se implementado)

---

#### Teste 8.3: Relatório de Conformidade LGPD
**Objetivo**: Gerar relatório para auditoria.

**Passos**:
1. `GET /audit/compliance-report?startDate=2025-01-01&endDate=2025-12-31`
2. Verificar resposta:
   - Total de tratamentos de dados
   - Breakdown por tipo (COLETA, CONSULTA, etc.)
   - Breakdown por base legal
   - Logs de acesso
   - Incidentes (data breaches)
   - Solicitações de titulares
3. Exportar relatório (PDF)

**Critério de Aceite**:
- [x] Relatório gerado corretamente
- [x] Dados precisos
- [x] PDF formatado e legível

---

### 9. Disponibilidade e Performance

#### Teste 9.1: Health Checks
**Objetivo**: Verificar endpoints de saúde.

**Passos**:
1. `GET /health`
   - Esperado: `{ "status": "ok", "timestamp": "...", "uptime": 12345 }`
2. `GET /readiness`
   - Esperado: `{ "status": "ready" }`
3. Simular falha no banco (parar container Postgres)
4. `GET /readiness`
   - Esperado: `500 Internal Server Error` ou `{ "status": "not ready" }`
5. Reiniciar banco e verificar que readiness volta a "ready"

**Critério de Aceite**:
- [x] Health check sempre retorna 200 (se app está rodando)
- [x] Readiness retorna erro se dependências (DB, Redis) estão falhando

---

#### Teste 9.2: Performance
**Objetivo**: Garantir latência aceitável.

**Passos**:
1. Executar queries comuns:
   - Listagem de propriedades (paginada, 20 itens): < 200ms
   - Busca por código: < 100ms
   - Filtros múltiplos: < 500ms
   - Query GIS (bbox): < 1s
   - Dashboard KPIs: < 500ms
2. Usar ferramenta (Postman, k6, JMeter) para medir
3. Com 100 usuários simultâneos: latência p95 < 2s

**Critério de Aceite**:
- [x] Latências abaixo dos limites
- [x] Erro rate < 1%

---

#### Teste 9.3: Uptime (99,5%)
**Objetivo**: Monitoramento contínuo.

**Passos**:
1. Configurar Uptime Robot ou similar para ping a cada 5 min
2. Monitorar por 30 dias
3. Calcular uptime: `(total_time - downtime) / total_time * 100`
4. Verificar que uptime ≥ 99,5%

**Critério de Aceite**:
- [x] Uptime ≥ 99,5% (máximo 3h39min de downtime/mês)
- [x] Alertas funcionam em caso de downtime

---

### 10. Segurança

#### Teste 10.1: Autenticação
**Objetivo**: Verificar login e proteção de rotas.

**Passos**:
1. Tentar acessar `/cadastro/properties` sem login
   - Esperado: Redirect para `/login` ou 401 Unauthorized
2. Fazer login com credenciais inválidas
   - Esperado: 401 Invalid credentials
3. Fazer login correto
   - Esperado: JWT retornado
4. Usar JWT para acessar rota protegida
   - Esperado: 200 OK

**Critério de Aceite**:
- [x] Rotas protegidas exigem autenticação
- [x] JWT válido permite acesso
- [x] JWT expirado é rejeitado

---

#### Teste 10.2: RBAC (Permissões)
**Objetivo**: Verificar controle de acesso por perfil.

**Passos**:
1. Login como AUDITOR (somente leitura)
2. Tentar deletar imóvel: `DELETE /cadastro/properties/:id`
   - Esperado: 403 Forbidden
3. Login como OPERATOR (leitura + escrita)
4. Deletar imóvel
   - Esperado: 204 No Content (sucesso)

**Critério de Aceite**:
- [x] Permissões são verificadas
- [x] Ações não autorizadas são bloqueadas
- [x] Mensagem de erro clara

---

#### Teste 10.3: Rate Limiting
**Objetivo**: Proteção contra abuso.

**Passos**:
1. Fazer 100 requests em 1 minuto para `/public/stats/count` (sem autenticação)
   - Esperado: Primeiros 30 funcionam, demais retornam 429 Too Many Requests
2. Aguardar 1 minuto
3. Fazer novo request
   - Esperado: 200 OK (contador resetado)

**Critério de Aceite**:
- [x] Rate limiting funciona
- [x] Contador reseta após janela de tempo

---

## ✅ Checklist Final de Validação

| Categoria | Testes | Passaram | Pendentes |
|-----------|--------|----------|-----------|
| Mapeamento GIS | 4 | ☐ | ☐ |
| Recadastramento | 3 | ☐ | ☐ |
| Endereçamento Digital | 2 | ☐ | ☐ |
| Privacidade Diferencial | 3 | ☐ | ☐ |
| Integração | 2 | ☐ | ☐ |
| Dashboards | 3 | ☐ | ☐ |
| Suporte (Tickets) | 3 | ☐ | ☐ |
| Auditoria/LGPD | 3 | ☐ | ☐ |
| Disponibilidade/Performance | 3 | ☐ | ☐ |
| Segurança | 3 | ☐ | ☐ |
| **TOTAL** | **29** | **☐** | **☐** |

---

## 📝 Relatório de Aceite (Template)

```markdown
# Relatório de Aceite - Sistema Cadastro Salesópolis

**Data**: __/__/____  
**Responsável Técnico**: _____________  
**Responsável Prefeitura**: _____________

## Resumo Executivo
- Total de testes executados: __/29
- Testes aprovados: __
- Testes com falha: __
- Bloqueadores: __ (críticos que impedem homologação)

## Detalhamento por Categoria
(Listar resultados de cada teste)

## Pendências Identificadas
1. [Teste X] - Descrição do problema - Severidade: CRÍTICA/MÉDIA/BAIXA
2. ...

## Recomendações
(Sugestões de melhorias)

## Aprovação
- [ ] Sistema aprovado para produção
- [ ] Sistema aprovado com ressalvas (listar)
- [ ] Sistema reprovado (necessário correções)

**Assinaturas**:
- Técnico: _____________ Data: __/__/____
- Prefeitura: _____________ Data: __/__/____
```

---

## 📚 Próximas Etapas

Após validação completa:
1. **Correções**: Ajustar falhas críticas
2. **Homologação**: Ambiente de staging com dados reais (anonimizados)
3. **Capacitação**: Treinamento de servidores (ver [09-IMPLANTACAO.md](09-IMPLANTACAO.md))
4. **Go-Live**: Deploy em produção
5. **Operação Assistida**: Suporte intensivo nas primeiras 2 semanas

---

**Última atualização**: 23/12/2025
