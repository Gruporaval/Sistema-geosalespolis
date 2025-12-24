# Guia de Integração

## 🔄 Visão Geral

Este documento descreve os processos de **importação** e **exportação** de dados do sistema, incluindo formatos suportados, mapeamentos de campos e APIs.

---

## 📥 Importação de Dados

### 1. Formatos Suportados

- **CSV** (delimitador: `,` ou `;`)
- **XLSX** (Excel 2007+)
- **JSON** (array de objetos)
- **XML** (formato customizado)
- **Shapefile** (apenas para geometrias GIS)
- **GeoJSON** / **KML** (geometrias)

---

### 2. Fluxo de Importação

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  Upload de  │────▶│  Validação   │────▶│ Processamento│────▶│   Relatório  │
│   Arquivo   │     │  de Formato  │     │   (Job)      │     │  de Resultado│
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
```

**Etapas**:
1. **Upload**: Frontend envia arquivo (POST `/integracao/import`)
2. **Validação**: Verifica formato, colunas obrigatórias, tipos de dados
3. **Mapeamento**: Usuário mapeia colunas do arquivo → campos do sistema
4. **Job Assíncrono**: Processa linhas em background (Bull Queue)
5. **Relatório**: Retorna sucessos, falhas e erros detalhados

---

### 3. API de Importação

#### 3.1. Upload de Arquivo

```http
POST /api/integracao/import
Content-Type: multipart/form-data

{
  "file": <binary>,
  "entity": "properties",
  "mappingId": "uuid" // Opcional: usar mapeamento salvo
}
```

**Resposta**:
```json
{
  "jobId": "job-uuid-12345",
  "status": "PENDING",
  "message": "Arquivo enviado. Processamento iniciado."
}
```

---

#### 3.2. Consultar Status do Job

```http
GET /api/integracao/jobs/:jobId
```

**Resposta**:
```json
{
  "id": "job-uuid-12345",
  "status": "COMPLETED", // PENDING | PROCESSING | COMPLETED | FAILED
  "entity": "properties",
  "totalRows": 1500,
  "successCount": 1485,
  "failureCount": 15,
  "startedAt": "2025-12-23T10:00:00Z",
  "completedAt": "2025-12-23T10:05:32Z",
  "errorLog": [
    {
      "row": 23,
      "error": "CPF inválido: 123456789"
    },
    {
      "row": 87,
      "error": "Endereço não encontrado"
    }
  ]
}
```

---

#### 3.3. Baixar Relatório de Erros

```http
GET /api/integracao/jobs/:jobId/errors.csv
```

Retorna CSV com:
```csv
linha,campo,valor,erro
23,proprietario_cpf,123456789,CPF inválido
87,endereco_id,END-999,Endereço não encontrado
```

---

### 4. Mapeamento de Campos

#### 4.1. Criar Mapeamento

```http
POST /api/integracao/mappings
Content-Type: application/json

{
  "name": "Importação IPTU 2024",
  "entity": "properties",
  "fields": [
    { "source": "CODIGO_IPTU", "target": "code" },
    { "source": "TIPO_IMOVEL", "target": "type", "transform": "TIPO_MAP" },
    { "source": "AREA_TERRENO", "target": "landArea", "transform": "PARSE_FLOAT" },
    { "source": "NOME_PROPRIETARIO", "target": "ownerName" },
    { "source": "CPF_PROPRIETARIO", "target": "ownerDocument", "transform": "FORMAT_CPF" }
  ]
}
```

**Transformações Disponíveis**:
- `PARSE_INT` - Converte para inteiro
- `PARSE_FLOAT` - Converte para decimal
- `FORMAT_CPF` - Formata CPF (XXX.XXX.XXX-XX)
- `FORMAT_CNPJ` - Formata CNPJ
- `UPPERCASE` - Maiúsculas
- `LOWERCASE` - Minúsculas
- `TRIM` - Remove espaços
- `TIPO_MAP` - Mapeia tipos (ex: "RES" → "RESIDENTIAL")
- `DATE_BR_TO_ISO` - Converte DD/MM/YYYY → YYYY-MM-DD

---

#### 4.2. Reutilizar Mapeamento

```http
GET /api/integracao/mappings

// Resposta
[
  {
    "id": "mapping-uuid-1",
    "name": "Importação IPTU 2024",
    "entity": "properties",
    "createdAt": "..."
  }
]
```

No upload, passar `mappingId`:
```json
{
  "file": <binary>,
  "entity": "properties",
  "mappingId": "mapping-uuid-1"
}
```

---

### 5. Exemplo de Importação CSV (Imóveis)

**Arquivo**: `imoveis.csv`
```csv
CODIGO_IPTU,TIPO_IMOVEL,AREA_TERRENO,AREA_CONSTRUIDA,NOME_PROPRIETARIO,CPF_PROPRIETARIO,RUA,NUMERO,BAIRRO
IM-2024-001,RES,450.5,180.3,João da Silva,12345678901,Rua das Flores,123,Centro
IM-2024-002,COM,1200.0,800.0,Maria Santos,98765432100,Av. Principal,456,Jardim
```

**Mapeamento**:
```json
{
  "CODIGO_IPTU": "code",
  "TIPO_IMOVEL": "type (RES→RESIDENTIAL, COM→COMMERCIAL)",
  "AREA_TERRENO": "landArea",
  "AREA_CONSTRUIDA": "builtArea",
  "NOME_PROPRIETARIO": "ownerName",
  "CPF_PROPRIETARIO": "ownerDocument",
  "RUA": "digitalAddress.street",
  "NUMERO": "digitalAddress.number",
  "BAIRRO": "digitalAddress.district"
}
```

**Resultado**:
- 2 imóveis criados
- Endereços vinculados (ou criados se não existirem)
- Log de auditoria registrado

---

## 📤 Exportação de Dados

### 1. API de Exportação

#### 1.1. Exportar Entidade

```http
POST /api/integracao/export
Content-Type: application/json

{
  "entity": "properties",
  "format": "CSV", // CSV | XLSX | JSON | XML | SHAPEFILE | GEOJSON
  "filters": {
    "type": "RESIDENTIAL",
    "district": "Centro",
    "createdAfter": "2024-01-01"
  },
  "fields": ["code", "type", "landArea", "ownerName", "digitalAddress.street"]
}
```

**Resposta** (Job assíncrono):
```json
{
  "jobId": "export-job-uuid-789",
  "status": "PENDING",
  "message": "Exportação iniciada. Você receberá um link para download."
}
```

---

#### 1.2. Consultar Status de Exportação

```http
GET /api/integracao/export-jobs/:jobId
```

**Resposta**:
```json
{
  "id": "export-job-uuid-789",
  "status": "COMPLETED",
  "format": "CSV",
  "entity": "properties",
  "rowCount": 3500,
  "fileSize": 2457600, // bytes
  "downloadUrl": "/api/integracao/export-jobs/export-job-uuid-789/download",
  "expiresAt": "2025-12-30T23:59:59Z" // Link válido por 7 dias
}
```

---

#### 1.3. Baixar Arquivo

```http
GET /api/integracao/export-jobs/:jobId/download
```

Retorna arquivo diretamente (Content-Disposition: attachment).

---

### 2. Formatos de Exportação

#### 2.1. CSV
- Delimitador: `,`
- Encoding: UTF-8 com BOM (compatível Excel)
- Cabeçalho com nomes de colunas
- Datas no formato ISO 8601 (`YYYY-MM-DD`)

#### 2.2. XLSX
- Planilha única: "Dados"
- Cabeçalhos em negrito
- Colunas com largura ajustada
- Datas formatadas (DD/MM/YYYY)

#### 2.3. JSON
```json
[
  {
    "id": "uuid-1",
    "code": "IM-2024-001",
    "type": "RESIDENTIAL",
    "landArea": 450.5,
    "ownerName": "João da Silva",
    "digitalAddress": {
      "street": "Rua das Flores",
      "number": "123",
      "district": "Centro"
    }
  }
]
```

#### 2.4. Shapefile (Geometrias)
- Arquivo ZIP contendo:
  - `.shp` - geometrias
  - `.shx` - índice
  - `.dbf` - atributos
  - `.prj` - projeção (EPSG:4674 - SIRGAS 2000)

#### 2.5. GeoJSON
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-45.8473, -23.5505]
      },
      "properties": {
        "code": "IM-2024-001",
        "type": "RESIDENTIAL",
        "landArea": 450.5
      }
    }
  ]
}
```

---

## 🔗 Integração com Sistemas Externos

### 1. Base de Dados Municipal Existente

**Cenário**: Migração de dados do sistema legado.

**Abordagem**:
1. **Extração**: Script SQL para exportar dados (CSV/JSON)
2. **Transformação**: Mapeamento de campos (ETL)
3. **Importação**: API `/integracao/import` com mapeamento salvo
4. **Validação**: Comparar totais, executar testes de amostragem

**Script de Extração** (exemplo PostgreSQL):
```sql
COPY (
  SELECT 
    codigo_iptu AS codigo_imovel,
    tipo_imovel,
    area_terreno,
    nome_proprietario,
    cpf_proprietario
  FROM imoveis_legado
  WHERE situacao = 'ATIVO'
) TO '/tmp/imoveis_export.csv' CSV HEADER;
```

---

### 2. Portal de Dados Abertos (LAI)

**Endpoint Público** (sem autenticação):
```http
GET /api/public/stats/count?dataset=properties&filter={"district":"Centro"}&epsilon=0.1
```

Retorna contagens com **privacidade diferencial** (ruído Laplace).

**Integração**:
- Permite que portais de transparência consumam dados sem expor informações sensíveis
- Orçamento de privacidade controlado (reset mensal)
- Supressão de células pequenas (< 5 registros)

---

### 3. Geocodificação Externa (Nominatim)

**Serviço**: OpenStreetMap Nominatim (gratuito)

**Endpoint**:
```http
GET https://nominatim.openstreetmap.org/search
?street=Rua das Flores 123
&city=Salesópolis
&state=SP
&country=Brazil
&format=json
```

**Resposta**:
```json
[
  {
    "lat": "-23.5505",
    "lon": "-45.8473",
    "display_name": "Rua das Flores, 123, Centro, Salesópolis, SP, Brazil"
  }
]
```

**Fallback**: Se Nominatim falhar, usar geocodificação interna (tabela de logradouros).

---

## ⚠️ Boas Práticas

### 1. Importação
- **Validar antes de salvar**: Verificar CPF, CEP, campos obrigatórios
- **Processamento em lote**: Inserir múltiplos registros de uma vez (batch insert)
- **Transações**: Rollback se houver erro crítico (opcional: modo "tudo ou nada")
- **Log detalhado**: Registrar linha, campo e erro para cada falha
- **Limite de tamanho**: Máximo 10 MB por arquivo (ou 50k linhas)

### 2. Exportação
- **Filtros obrigatórios**: Evitar exportações totais não intencionais
- **Limite de registros**: Máximo 100k linhas por exportação
- **Paginação**: Para exportações grandes, dividir em múltiplos arquivos
- **Compressão**: ZIP para arquivos > 5 MB
- **Expiração**: Links de download expiram em 7 dias

### 3. Segurança
- **Autenticação**: Importação/exportação requerem login
- **Permissões**: Verificar `integration:read` e `integration:write`
- **Auditoria**: Registrar todas as operações (quem, quando, o quê)
- **Dados sensíveis**: Não exportar senhas, tokens, dados médicos

### 4. Performance
- **Jobs assíncronos**: Não bloquear a UI
- **Progresso em tempo real**: WebSocket ou polling para status
- **Cache**: Armazenar mapeamentos frequentes
- **Rate limiting**: Máximo 10 importações/exportações por hora/usuário

---

## 📊 Monitoramento

### Métricas
- Total de importações/exportações (por dia/mês)
- Taxa de sucesso/falha
- Tempo médio de processamento
- Tamanho médio de arquivos

### Alertas
- Falha em > 50% das linhas → Notificar admin
- Job travado por > 30 min → Timeout e notificação
- Disco cheio → Pausar novos jobs

---

## 🧪 Testes de Integração

### Cenário 1: Importação de 10k Imóveis
1. Preparar CSV com 10.000 linhas
2. Upload via API
3. Aguardar conclusão (< 5 min)
4. Verificar: 10k registros criados, 0 falhas

### Cenário 2: Exportação de Shapefile
1. Filtrar imóveis com geometria (5k registros)
2. Exportar formato SHAPEFILE
3. Baixar ZIP
4. Abrir no QGIS e verificar geometrias

### Cenário 3: Mapeamento Customizado
1. Criar mapeamento "IPTU 2024"
2. Upload de arquivo com colunas diferentes
3. Aplicar mapeamento
4. Verificar transformações (ex: "RES" → "RESIDENTIAL")

---

**Última atualização**: 23/12/2025
