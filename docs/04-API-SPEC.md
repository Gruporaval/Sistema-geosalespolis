# API Specification - Sistema Cadastro Salesópolis

## 🔌 Visão Geral

Base URL (produção): `https://api.cadastro.salesopolis.sp.gov.br/v1`  
Base URL (staging): `https://api-staging.cadastro.salesopolis.sp.gov.br/v1`  
Base URL (dev local): `http://localhost:3000/v1`

**Protocolos**: REST + JSON  
**Autenticação**: JWT Bearer Token  
**Versionamento**: URI path (`/v1/`, `/v2/`)  
**Rate Limiting**: 100 req/min por IP (pública); 500 req/min (autenticada)

---

## 🔐 Autenticação

### POST /auth/login
Login com email e senha.

**Request**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "SenhaSegura123!"
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "João Silva",
    "role": "OPERATOR",
    "permissions": ["gis:read", "gis:write", "cadastro:read", "cadastro:write"]
  }
}
```

**Errors**:
- `400`: Email ou senha inválidos
- `401`: Credenciais incorretas
- `403`: Usuário inativo

---

### POST /auth/refresh
Renovar access token.

**Request**:
```json
{
  "refreshToken": "abc123..."
}
```

**Response (200)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

### POST /auth/logout
Invalidar tokens (adicionar à blacklist).

**Headers**: `Authorization: Bearer <token>`

**Response (204)**: No content

---

### GET /auth/me
Informações do usuário logado.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "usuario@exemplo.com",
  "name": "João Silva",
  "cpf": "12345678901",
  "role": {
    "id": "uuid",
    "name": "OPERATOR",
    "description": "Operador de cadastro e GIS"
  },
  "permissions": ["gis:read", "gis:write", "cadastro:read", "cadastro:write"],
  "mfaEnabled": false,
  "createdAt": "2025-01-01T10:00:00Z",
  "lastLoginAt": "2025-12-23T08:30:00Z"
}
```

---

### POST /auth/mfa/enable
Habilitar autenticação de dois fatores (TOTP).

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "backupCodes": ["12345678", "87654321", ...]
}
```

**Next step**: Cliente deve confirmar com código TOTP via `POST /auth/mfa/verify`

---

## 👥 Usuários

### GET /users
Listar usuários (requer permissão `users:read`).

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `role`: Filtrar por role
- `is_active`: true/false
- `search`: Busca por nome ou email

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "operador@exemplo.com",
      "name": "Maria Santos",
      "cpf": "98765432100",
      "role": {
        "id": "uuid",
        "name": "OPERATOR"
      },
      "isActive": true,
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLoginAt": "2025-12-20T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### POST /users
Criar usuário (requer `users:manage`).

**Request**:
```json
{
  "email": "novo@exemplo.com",
  "password": "SenhaSegura123!",
  "name": "Novo Usuário",
  "cpf": "12312312312",
  "phone": "(11) 98765-4321",
  "roleId": "uuid"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "email": "novo@exemplo.com",
  "name": "Novo Usuário",
  "cpf": "12312312312",
  "role": {
    "id": "uuid",
    "name": "OPERATOR"
  },
  "isActive": true,
  "createdAt": "2025-12-23T10:00:00Z"
}
```

**Validations**:
- Email único
- CPF válido e único
- Senha: min 8 chars, 1 upper, 1 lower, 1 number, 1 special

---

### PATCH /users/:id
Atualizar usuário (requer `users:manage`).

**Request**:
```json
{
  "name": "Nome Atualizado",
  "phone": "(11) 99999-9999",
  "isActive": false
}
```

**Response (200)**: Objeto user atualizado

---

### DELETE /users/:id
Deletar usuário (soft delete, requer `users:manage`).

**Response (204)**: No content

---

## 🗺️ GIS

### GET /gis/layers
Listar camadas GIS disponíveis.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Lotes",
      "slug": "lotes",
      "description": "Lotes cadastrados",
      "geometryType": "POLYGON",
      "srid": 4674,
      "style": {
        "fillColor": "#ff7800",
        "color": "#000",
        "weight": 1,
        "fillOpacity": 0.5
      },
      "isVisible": true,
      "displayOrder": 1,
      "permissions": {
        "read": ["ADMIN", "OPERATOR", "AUDITOR"],
        "write": ["ADMIN", "OPERATOR"]
      }
    }
  ]
}
```

---

### GET /gis/features
Buscar feições (geometrias) com filtros espaciais.

**Query Params**:
- `layer`: Slug da camada (obrigatório)
- `bbox`: Bounding box (ex: `-46.1,-23.6,-46.0,-23.5`)
- `limit`: Max results (default: 100)
- `properties`: Filtro por propriedades JSON (ex: `properties.zona=A`)

**Response (200)**:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "uuid",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-46.0820, -23.5320],
            [-46.0810, -23.5320],
            [-46.0810, -23.5310],
            [-46.0820, -23.5310],
            [-46.0820, -23.5320]
          ]
        ]
      },
      "properties": {
        "codigo": "LT-001",
        "area": 450.5,
        "zona": "A",
        "proprietario": "João da Silva"
      }
    }
  ],
  "crs": {
    "type": "name",
    "properties": {
      "name": "EPSG:4674"
    }
  }
}
```

---

### GET /gis/features/:id
Detalhe de uma feição específica.

**Response (200)**:
```json
{
  "id": "uuid",
  "layerId": "uuid",
  "layerName": "Lotes",
  "geometry": { ... },
  "properties": { ... },
  "createdBy": {
    "id": "uuid",
    "name": "Maria Santos"
  },
  "createdAt": "2025-01-10T10:00:00Z",
  "updatedAt": "2025-12-20T15:30:00Z"
}
```

---

### POST /gis/features
Criar nova feição (requer `gis:write`).

**Request**:
```json
{
  "layerId": "uuid",
  "geometry": {
    "type": "Polygon",
    "coordinates": [...]
  },
  "properties": {
    "codigo": "LT-999",
    "area": 500.0,
    "zona": "B"
  }
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "layerId": "uuid",
  "geometry": { ... },
  "properties": { ... },
  "createdAt": "2025-12-23T10:00:00Z"
}
```

**Validations**:
- Geometria válida (ST_IsValid)
- SRID correto (4674 ou 4326)
- Layer existe e usuário tem permissão de escrita

**Audit**: Log criado automaticamente em `audit_log`

---

### PUT /gis/features/:id
Atualizar feição (requer `gis:write`).

**Request**: Mesmo formato do POST

**Response (200)**: Feição atualizada

**Audit**: Log de UPDATE com before/after

---

### DELETE /gis/features/:id
Deletar feição (soft delete, requer `gis:delete`).

**Response (204)**: No content

**Audit**: Log de DELETE

---

### GET /gis/export
Exportar dados GIS (requer `gis:export`).

**Query Params**:
- `layer`: Slug da camada
- `format`: `shapefile`, `geojson`, `kml`
- `bbox`: Opcional (filtro espacial)
- `properties`: Filtro por atributos

**Response (200)**:
- `Content-Type: application/zip` (Shapefile)
- `Content-Type: application/geo+json` (GeoJSON)
- `Content-Type: application/vnd.google-earth.kml+xml` (KML)

**Exemplo**:
```
GET /gis/export?layer=lotes&format=geojson&bbox=-46.1,-23.6,-46.0,-23.5
```

**Audit**: Log de EXPORT com filtros aplicados

---

## 🏘️ Cadastro Imobiliário

### GET /cadastro/properties
Listar propriedades.

**Query Params**:
- `page`, `limit`
- `situacao`: ATIVO, INATIVO, EM_RECADASTRAMENTO
- `tipo_imovel`: RESIDENCIAL, COMERCIAL, etc.
- `bairro`: Filtro por bairro
- `search`: Busca por código, nome proprietário, CPF/CNPJ

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "codigoImovel": "IM-2025-00001",
      "tipoImovel": "RESIDENCIAL",
      "areaTerreno": 450.00,
      "areaConstruida": 120.50,
      "proprietarioNome": "João da Silva",
      "proprietarioCpfCnpj": "12345678901",
      "usoPredominante": "RESIDENCIAL",
      "situacao": "ATIVO",
      "inscricaoMunicipal": "12345.001",
      "endereco": {
        "codigo": "SAL-2025-00100",
        "logradouro": "Rua das Flores",
        "numero": "123",
        "bairro": "Centro",
        "cep": "08970-000"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-45.8472, -23.5321]
      },
      "createdAt": "2025-06-15T10:00:00Z",
      "updatedAt": "2025-12-20T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /cadastro/properties/:id
Detalhe completo de propriedade.

**Response (200)**:
```json
{
  "id": "uuid",
  "codigoImovel": "IM-2025-00001",
  "tipoImovel": "RESIDENCIAL",
  "areaTerreno": 450.00,
  "areaConstruida": 120.50,
  "proprietarioNome": "João da Silva",
  "proprietarioCpfCnpj": "12345678901",
  "proprietarioTelefone": "(11) 98765-4321",
  "proprietarioEmail": "joao@exemplo.com",
  "usoPredominante": "RESIDENCIAL",
  "situacao": "ATIVO",
  "inscricaoMunicipal": "12345.001",
  "inscricaoEstadual": null,
  "matriculaRegistro": "Cartório 1º - Matrícula 12345",
  "observacoes": "Imóvel esquina com comércio no térreo",
  "endereco": { ... },
  "geometry": { ... },
  "attachments": [
    {
      "id": "uuid",
      "fileName": "escritura.pdf",
      "fileType": "DOCUMENT",
      "fileSize": 1024000,
      "uploadedAt": "2025-06-15T11:00:00Z",
      "uploadedBy": {
        "id": "uuid",
        "name": "Maria Santos"
      }
    }
  ],
  "createdBy": { ... },
  "updatedBy": { ... },
  "createdAt": "2025-06-15T10:00:00Z",
  "updatedAt": "2025-12-20T14:30:00Z"
}
```

---

### POST /cadastro/properties
Criar propriedade (requer `cadastro:write`).

**Request**:
```json
{
  "codigoImovel": "IM-2025-99999",
  "tipoImovel": "RESIDENCIAL",
  "areaTerreno": 500.00,
  "areaConstruida": 150.00,
  "proprietarioNome": "Maria Oliveira",
  "proprietarioCpfCnpj": "98765432100",
  "proprietarioTelefone": "(11) 91234-5678",
  "proprietarioEmail": "maria@exemplo.com",
  "usoPredominante": "RESIDENCIAL",
  "inscricaoMunicipal": "12345.999",
  "digitalAddressId": "uuid",
  "geometryId": "uuid",
  "observacoes": "Primeira versão do cadastro"
}
```

**Response (201)**: Propriedade criada

**Validations**:
- `codigoImovel` único
- `proprietarioCpfCnpj` válido
- `areaTerreno` > 0
- `digitalAddressId` e `geometryId` existem

**Audit**: Log de CREATE + registro LGPD (coleta de dados)

---

### PATCH /cadastro/properties/:id
Atualizar propriedade (requer `cadastro:write`).

**Request**: Campos a atualizar (partial)

**Response (200)**: Propriedade atualizada

**Audit**: Log de UPDATE com before/after + histórico em `property_history`

---

### DELETE /cadastro/properties/:id
Deletar propriedade (soft delete, requer `cadastro:delete`).

**Response (204)**: No content

**Audit**: Log de DELETE

---

### GET /cadastro/properties/:id/history
Histórico de alterações de uma propriedade.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "changedAt": "2025-12-20T14:30:00Z",
      "changedBy": {
        "id": "uuid",
        "name": "Maria Santos"
      },
      "changeType": "UPDATE",
      "oldValues": {
        "areaTerreno": 450.00,
        "proprietarioTelefone": "(11) 98765-4321"
      },
      "newValues": {
        "areaTerreno": 500.00,
        "proprietarioTelefone": "(11) 91111-1111"
      }
    }
  ]
}
```

---

### POST /cadastro/properties/:id/attachments
Upload de anexo (documento ou foto).

**Request**: `multipart/form-data`
```
file: <binary>
fileType: DOCUMENT | PHOTO | OTHER
description: "Escritura do imóvel"
```

**Response (201)**:
```json
{
  "id": "uuid",
  "fileName": "escritura.pdf",
  "fileType": "DOCUMENT",
  "fileSize": 1024000,
  "storagePath": "attachments/properties/{property_id}/escritura.pdf",
  "uploadedAt": "2025-12-23T10:00:00Z"
}
```

**Audit**: Log de UPLOAD

---

### GET /cadastro/properties/:id/attachments/:attachmentId/download
Download de anexo.

**Response (200)**:
- `Content-Type`: Tipo do arquivo (application/pdf, image/jpeg, etc.)
- `Content-Disposition`: attachment; filename="escritura.pdf"
- Body: Binary data

**Audit**: Log de DOWNLOAD (somente se configurado)

---

## 📍 Endereçamento Digital

### GET /enderecamento/addresses
Listar endereços digitais.

**Query Params**:
- `search`: Busca por logradouro, bairro, CEP
- `validated`: true/false (apenas endereços validados)
- `page`, `limit`

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo": "SAL-2025-00001",
      "logradouro": "Rua das Flores",
      "numero": "123",
      "bairro": "Centro",
      "cep": "08970-000",
      "latitude": -23.5321,
      "longitude": -45.8472,
      "validated": true,
      "validatedAt": "2025-12-20T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /enderecamento/addresses/:id
Detalhe de endereço.

**Response (200)**: Objeto completo do endereço

---

### POST /enderecamento/addresses
Criar endereço digital (requer `enderecamento:write`).

**Request**:
```json
{
  "logradouro": "Avenida Principal",
  "numero": "500",
  "complemento": "Sala 10",
  "bairro": "Jardim São Paulo",
  "cep": "08970-100"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "codigo": "SAL-2025-01234",
  "logradouro": "Avenida Principal",
  "numero": "500",
  "complemento": "Sala 10",
  "bairro": "Jardim São Paulo",
  "cep": "08970-100",
  "municipio": "Salesópolis",
  "uf": "SP",
  "latitude": null,
  "longitude": null,
  "geocodingSource": null,
  "validated": false,
  "createdAt": "2025-12-23T10:00:00Z"
}
```

**Next step**: Geocodificar via `POST /enderecamento/geocode`

---

### POST /enderecamento/geocode
Geocodificar endereço (endereço → lat/lng).

**Request**:
```json
{
  "addressId": "uuid"
}
```

ou

```json
{
  "logradouro": "Rua das Flores",
  "numero": "123",
  "bairro": "Centro",
  "cep": "08970-000",
  "municipio": "Salesópolis",
  "uf": "SP"
}
```

**Response (200)**:
```json
{
  "latitude": -23.5321,
  "longitude": -45.8472,
  "source": "NOMINATIM",
  "confidence": 0.95
}
```

Se `addressId` fornecido, atualiza o registro automaticamente.

---

### POST /enderecamento/reverse-geocode
Geocodificação reversa (lat/lng → endereço).

**Request**:
```json
{
  "latitude": -23.5321,
  "longitude": -45.8472
}
```

**Response (200)**:
```json
{
  "logradouro": "Rua das Flores",
  "numero": "123",
  "bairro": "Centro",
  "cep": "08970-000",
  "municipio": "Salesópolis",
  "uf": "SP",
  "source": "NOMINATIM",
  "confidence": 0.90
}
```

---

## 🔄 Integração

### POST /integracao/import
Importar dados de arquivo (CSV, XLSX, JSON).

**Request**: `multipart/form-data`
```
file: <binary>
mappingId: uuid (opcional, se já existe mapeamento salvo)
entityType: property | address | gis_feature
```

**Response (202)**: Accepted (processamento assíncrono)
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "message": "Importação iniciada. Acompanhe o status em /integracao/jobs/{jobId}"
}
```

**Polling**: `GET /integracao/jobs/:jobId`

---

### GET /integracao/jobs/:id
Status de job de integração.

**Response (200)**:
```json
{
  "id": "uuid",
  "integrationType": "IMPORT",
  "fileName": "imoveis.csv",
  "status": "SUCCESS",
  "recordsTotal": 1000,
  "recordsSuccess": 950,
  "recordsFailed": 50,
  "errorDetails": [
    {
      "row": 10,
      "error": "CPF inválido: 11111111111"
    },
    {
      "row": 25,
      "error": "Área terreno deve ser > 0"
    }
  ],
  "startedAt": "2025-12-23T10:00:00Z",
  "completedAt": "2025-12-23T10:05:30Z"
}
```

---

### POST /integracao/export
Exportar dados (CSV, XLSX, JSON).

**Request**:
```json
{
  "entityType": "property",
  "format": "csv",
  "filters": {
    "situacao": "ATIVO",
    "bairro": "Centro"
  },
  "columns": ["codigoImovel", "proprietarioNome", "areaTerreno", "endereco.logradouro"]
}
```

**Response (202)**: Accepted
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "message": "Exportação iniciada. Arquivo disponível em /integracao/exports/{jobId}/download quando concluído"
}
```

---

### GET /integracao/exports/:id/download
Download de arquivo exportado.

**Response (200)**:
- `Content-Type`: text/csv | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | application/json
- Body: Arquivo

---

### GET /integracao/mappings
Listar mapeamentos de campos salvos.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Importação Sistema Legado",
      "description": "Mapeamento para importar do sistema antigo",
      "sourceSystem": "SistemaLegadoX",
      "entityType": "property",
      "fieldMappings": {
        "COD_IMOVEL": "codigoImovel",
        "TIPO": "tipoImovel",
        "AREA_M2": "areaTerreno",
        "PROPRIETARIO": "proprietarioNome",
        "CPF": "proprietarioCpfCnpj"
      },
      "transformations": {
        "tipoImovel": "uppercase",
        "proprietarioNome": "trim"
      },
      "isActive": true,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

### POST /integracao/mappings
Criar mapeamento de campos.

**Request**:
```json
{
  "name": "Mapeamento Novo",
  "description": "...",
  "sourceSystem": "SistemaX",
  "entityType": "property",
  "fieldMappings": { ... },
  "transformations": { ... }
}
```

**Response (201)**: Mapeamento criado

---

## 📊 Dashboards

### GET /dashboard/metrics
KPIs principais do sistema.

**Response (200)**:
```json
{
  "properties": {
    "total": 12500,
    "active": 11800,
    "inProgress": 700,
    "withAddress": 11500,
    "withGeometry": 10800,
    "percentComplete": 92.0
  },
  "addresses": {
    "total": 11500,
    "validated": 10200,
    "percentValidated": 88.7
  },
  "recadastro": {
    "completedThisMonth": 350,
    "target": 500,
    "percentTarget": 70.0
  },
  "integrations": {
    "lastWeek": 15,
    "successRate": 95.3
  }
}
```

---

### GET /dashboard/charts/properties-by-region
Dados para gráfico de propriedades por região.

**Response (200)**:
```json
{
  "data": [
    { "bairro": "Centro", "count": 1500 },
    { "bairro": "Jardim São Paulo", "count": 2300 },
    { "bairro": "Vila Nova", "count": 800 }
  ]
}
```

---

### GET /dashboard/charts/properties-by-type
Propriedades por tipo.

**Response (200)**:
```json
{
  "data": [
    { "type": "RESIDENCIAL", "count": 9000 },
    { "type": "COMERCIAL", "count": 2500 },
    { "type": "INDUSTRIAL", "count": 800 },
    { "type": "RURAL", "count": 200 }
  ]
}
```

---

### POST /dashboard/reports
Gerar relatório customizado (PDF ou CSV).

**Request**:
```json
{
  "reportType": "properties_summary",
  "format": "pdf",
  "filters": {
    "situacao": "ATIVO",
    "bairro": "Centro"
  },
  "includeCharts": true
}
```

**Response (202)**: Accepted
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "message": "Relatório sendo gerado"
}
```

**Download**: `GET /dashboard/reports/:jobId/download`

---

## 🔍 Auditoria

### GET /audit/logs
Consultar logs de auditoria (requer `audit:read`).

**Query Params**:
- `userId`: Filtrar por usuário
- `action`: CREATE, UPDATE, DELETE, READ, EXPORT
- `entityType`: property, user, gis_feature, etc.
- `entityId`: ID específico
- `startDate`, `endDate`: Período
- `page`, `limit`

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "Maria Santos",
        "email": "maria@exemplo.com"
      },
      "action": "UPDATE",
      "entityType": "property",
      "entityId": "uuid",
      "changes": {
        "before": { "areaTerreno": 450.00 },
        "after": { "areaTerreno": 500.00 }
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2025-12-20T14:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /audit/compliance-report
Relatório de conformidade LGPD (requer `audit:read`).

**Query Params**:
- `startDate`, `endDate`: Período

**Response (200)**:
```json
{
  "period": {
    "start": "2025-12-01T00:00:00Z",
    "end": "2025-12-31T23:59:59Z"
  },
  "dataTreatment": {
    "total": 1500,
    "byType": {
      "COLETA": 500,
      "CONSULTA": 800,
      "ATUALIZACAO": 150,
      "EXCLUSAO": 50
    },
    "byLegalBasis": {
      "Art. 7, I - Consentimento": 200,
      "Art. 7, II - Obrigação legal": 1300
    }
  },
  "accessLogs": {
    "total": 25000,
    "uniqueUsers": 45,
    "failedAttempts": 120
  },
  "dataBreaches": 0,
  "subjectRequests": {
    "total": 5,
    "byType": {
      "access": 3,
      "deletion": 2
    }
  }
}
```

---

## 🔓 Portal Público (com Privacidade Diferencial)

### GET /public/stats/count
Contagem com privacidade diferencial.

**Query Params**:
- `dataset`: properties, addresses
- `filter`: JSON (ex: `{"bairro":"Centro"}`)
- `epsilon`: Orçamento de privacidade a consumir (default: 0.1)

**Response (200)**:
```json
{
  "query": {
    "dataset": "properties",
    "filter": { "bairro": "Centro" },
    "epsilon": 0.1
  },
  "result": 1523,
  "budgetRemaining": {
    "epsilon": 0.85,
    "nextReset": "2026-01-01T00:00:00Z"
  },
  "note": "Resultado com ruído aplicado para preservar privacidade"
}
```

**Nota**: O valor real (1500) teve ruído Laplace adicionado (+23).

---

### GET /public/stats/mean
Média com privacidade diferencial.

**Query Params**:
- `dataset`: properties
- `column`: areaTerreno, areaConstruida
- `filter`: JSON
- `epsilon`: Default 0.1

**Response (200)**:
```json
{
  "query": { ... },
  "result": 457.32,
  "unit": "m²",
  "budgetRemaining": { ... }
}
```

---

### GET /public/stats/histogram
Histograma com privacidade diferencial.

**Query Params**:
- `dataset`: properties
- `column`: areaTerreno
- `bins`: Número de faixas (ex: 10)
- `filter`: JSON
- `epsilon`: Default 0.2

**Response (200)**:
```json
{
  "query": { ... },
  "result": [
    { "range": "0-100", "count": 120 },
    { "range": "100-200", "count": 450 },
    { "range": "200-300", "count": 680 },
    { "range": "300-400", "count": 520 },
    { "range": "400-500", "count": 380 }
  ],
  "budgetRemaining": { ... }
}
```

---

## 🎫 Suporte (Tickets)

### POST /suporte/tickets
Criar ticket.

**Request**:
```json
{
  "subject": "Erro ao importar arquivo CSV",
  "description": "Ao tentar importar o arquivo anexo, recebo erro de validação...",
  "priority": "HIGH",
  "category": "TECHNICAL"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "ticketNumber": 12345,
  "subject": "Erro ao importar arquivo CSV",
  "priority": "HIGH",
  "category": "TECHNICAL",
  "status": "OPEN",
  "slaDeadline": "2025-12-23T14:00:00Z",
  "createdAt": "2025-12-23T10:00:00Z"
}
```

---

### GET /suporte/tickets
Listar tickets.

**Query Params**:
- `status`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `assignedToMe`: true (tickets do usuário logado)
- `page`, `limit`

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "ticketNumber": 12345,
      "subject": "Erro ao importar arquivo CSV",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "requester": {
        "id": "uuid",
        "name": "João Silva"
      },
      "assignedTo": {
        "id": "uuid",
        "name": "Maria Suporte"
      },
      "slaDeadline": "2025-12-23T14:00:00Z",
      "createdAt": "2025-12-23T10:00:00Z",
      "updatedAt": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /suporte/tickets/:id
Detalhe do ticket com mensagens.

**Response (200)**:
```json
{
  "id": "uuid",
  "ticketNumber": 12345,
  "subject": "Erro ao importar arquivo CSV",
  "description": "Ao tentar importar...",
  "priority": "HIGH",
  "category": "TECHNICAL",
  "status": "IN_PROGRESS",
  "requester": { ... },
  "assignedTo": { ... },
  "slaDeadline": "2025-12-23T14:00:00Z",
  "messages": [
    {
      "id": "uuid",
      "sender": {
        "id": "uuid",
        "name": "Maria Suporte"
      },
      "message": "Olá João, estamos analisando o arquivo. Qual o formato?",
      "isInternal": false,
      "createdAt": "2025-12-23T10:15:00Z"
    },
    {
      "id": "uuid",
      "sender": {
        "id": "uuid",
        "name": "João Silva"
      },
      "message": "É um CSV com ponto e vírgula como delimitador",
      "isInternal": false,
      "createdAt": "2025-12-23T10:20:00Z"
    }
  ],
  "createdAt": "2025-12-23T10:00:00Z",
  "updatedAt": "2025-12-23T10:30:00Z"
}
```

---

### POST /suporte/tickets/:id/messages
Adicionar mensagem ao ticket.

**Request**:
```json
{
  "message": "Consegui resolver trocando o delimitador. Obrigado!",
  "isInternal": false
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "message": "Consegui resolver trocando o delimitador. Obrigado!",
  "sender": { ... },
  "createdAt": "2025-12-23T10:40:00Z"
}
```

---

### PATCH /suporte/tickets/:id
Atualizar ticket (status, prioridade, atribuição).

**Request**:
```json
{
  "status": "RESOLVED",
  "assignedTo": "uuid"
}
```

**Response (200)**: Ticket atualizado

---

## 🚨 Error Responses

Todos os erros seguem o formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Erro de validação",
    "details": [
      {
        "field": "proprietarioCpfCnpj",
        "message": "CPF inválido"
      }
    ],
    "timestamp": "2025-12-23T10:00:00Z",
    "path": "/cadastro/properties"
  }
}
```

**Códigos HTTP**:
- `400`: Bad Request (validação, parâmetros inválidos)
- `401`: Unauthorized (não autenticado)
- `403`: Forbidden (sem permissão)
- `404`: Not Found (recurso não encontrado)
- `409`: Conflict (duplicação, ex: CPF já cadastrado)
- `422`: Unprocessable Entity (entidade inválida)
- `429`: Too Many Requests (rate limit excedido)
- `500`: Internal Server Error

---

## 📖 Próximo Documento

[05-SEGURANCA-LGPD.md](05-SEGURANCA-LGPD.md) - Checklist de segurança e conformidade

---

**Última atualização**: 23/12/2025
