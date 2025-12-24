# 🤝 Guia de Contribuição e Boas Práticas

## 📋 Visão Geral

Este documento estabelece **padrões de desenvolvimento** para garantir qualidade, consistência e manutenibilidade do código.

---

## 🏗️ Arquitetura e Padrões

### Backend (NestJS)

#### Estrutura de Módulos
```typescript
modules/
└── nome-modulo/
    ├── nome-modulo.module.ts       # Módulo NestJS
    ├── nome-modulo.service.ts      # Lógica de negócio
    ├── nome-modulo.controller.ts   # Endpoints REST
    ├── dto/                        # Data Transfer Objects
    │   ├── create-nome.dto.ts
    │   ├── update-nome.dto.ts
    │   └── query-nome.dto.ts
    ├── entities/                   # Entidades (se usar TypeORM)
    │   └── nome.entity.ts
    └── tests/                      # Testes unitários
        ├── nome-modulo.service.spec.ts
        └── nome-modulo.controller.spec.ts
```

#### Boas Práticas - Service
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { AuditService } from '@/common/audit/audit.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ✅ Nome descritivo
  async findAll(filters: QueryPropertiesDto) {
    // ✅ Validação de entrada
    if (filters.page < 1) {
      throw new BadRequestException('Page must be >= 1');
    }

    // ✅ Usar transações para operações múltiplas
    return this.prisma.$transaction(async (tx) => {
      const [data, total] = await Promise.all([
        tx.property.findMany({ 
          where: this.buildFilters(filters),
          skip: (filters.page - 1) * filters.pageSize,
          take: filters.pageSize,
        }),
        tx.property.count({ where: this.buildFilters(filters) }),
      ]);

      return { data, meta: { total, page: filters.page, pageSize: filters.pageSize } };
    });
  }

  // ✅ Tratamento de erros claro
  async findById(id: string): Promise<Property> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  // ✅ Registrar auditoria
  async update(id: string, dto: UpdatePropertyDto, userId: string) {
    const before = await this.findById(id);
    
    const updated = await this.prisma.property.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId,
      action: 'UPDATE',
      entityType: 'property',
      entityId: id,
      changes: { before, after: updated },
    });

    return updated;
  }

  // ✅ Método privado para lógica complexa
  private buildFilters(filters: QueryPropertiesDto) {
    const where: any = {};
    
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { ownerName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
```

#### Boas Práticas - Controller
```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertiesDto } from './dto';

// ✅ Tags Swagger para agrupamento
@ApiTags('Properties')
// ✅ Autenticação obrigatória
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('cadastro/properties')
export class PropertiesController {
  constructor(private readonly service: PropertiesService) {}

  // ✅ Documentação Swagger completa
  @Get()
  @ApiOperation({ summary: 'List all properties with filters' })
  @ApiResponse({ status: 200, description: 'Properties found' })
  @RequirePermissions('properties:read')
  async findAll(@Query() query: QueryPropertiesDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ status: 201, description: 'Property created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @RequirePermissions('properties:write')
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, userId);
  }

  // ✅ Validação automática de UUID
  @Patch(':id')
  @RequirePermissions('properties:write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, userId);
  }
}
```

#### Boas Práticas - DTOs
```typescript
import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePropertyDto {
  // ✅ Decoradores de validação + documentação Swagger
  @ApiProperty({ example: 'IM-2025-001', description: 'Property code (unique)' })
  @IsString()
  code: string;

  @ApiProperty({ enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'] })
  @IsEnum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'RURAL', 'MIXED', 'VACANT'])
  type: string;

  @ApiProperty({ example: 450.5, description: 'Land area in square meters' })
  @IsNumber()
  @Min(0)
  landArea: number;

  @ApiPropertyOptional({ example: 180.3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  builtArea?: number;

  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  ownerName: string;

  @ApiProperty({ example: '12345678901', description: 'CPF (11 digits)' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF must be 11 digits' })
  ownerDocument: string;
}

// ✅ DTO de query com paginação
export class QueryPropertiesDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: ['RESIDENTIAL', 'COMMERCIAL'] })
  @IsOptional()
  @IsEnum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'RURAL'])
  type?: string;

  @ApiPropertyOptional({ example: 'João' })
  @IsOptional()
  @IsString()
  search?: string;
}
```

---

### Frontend (React + TypeScript)

#### Estrutura de Componentes
```
components/
└── NomeComponente/
    ├── NomeComponente.tsx
    ├── NomeComponente.styles.ts  # (se usar styled-components)
    ├── NomeComponente.test.tsx
    └── index.ts                  # Re-export
```

#### Boas Práticas - Componente
```typescript
import { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProperties } from '@/features/properties/propertiesSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { Property } from '@/types/property';

// ✅ Props interface bem definida
interface PropertiesListProps {
  onEdit?: (property: Property) => void;
  filters?: {
    type?: string;
    status?: string;
  };
}

// ✅ Nome de componente em PascalCase
export default function PropertiesList({ onEdit, filters }: PropertiesListProps) {
  const dispatch = useAppDispatch();
  const { items, isLoading, error } = useAppSelector((state) => state.properties);
  const { hasPermission } = usePermissions();

  // ✅ useEffect para carregamento inicial
  useEffect(() => {
    dispatch(fetchProperties({ filters }));
  }, [dispatch, filters]);

  // ✅ Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // ✅ Empty state
  if (items.length === 0) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">Nenhum imóvel encontrado</Typography>
      </Box>
    );
  }

  // ✅ Renderização condicional baseada em permissão
  return (
    <Box>
      {items.map((property) => (
        <Box key={property.id} p={2} borderBottom="1px solid #e0e0e0">
          <Typography variant="h6">{property.code}</Typography>
          <Typography variant="body2">{property.ownerName}</Typography>
          
          {hasPermission('properties:write') && (
            <Button
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(property)}
            >
              Editar
            </Button>
          )}
        </Box>
      ))}
    </Box>
  );
}
```

#### Boas Práticas - Redux Slice
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Property } from '@/types/property';

// ✅ Interface de estado bem definida
interface PropertiesState {
  items: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

const initialState: PropertiesState = {
  items: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  pagination: { total: 0, page: 1, pageSize: 20 },
};

// ✅ Async thunk para API calls
export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (params: { page?: number; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await api.get('/cadastro/properties', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao carregar');
    }
  },
);

// ✅ Slice bem estruturado
const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    // ✅ Actions síncronas
    setSelectedProperty: (state, action: PayloadAction<Property | null>) => {
      state.selectedProperty = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ✅ Tratamento de estados async (pending, fulfilled, rejected)
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProperty, clearError } = propertiesSlice.actions;
export default propertiesSlice.reducer;
```

---

## 🧪 Testes

### Backend - Jest
```typescript
describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // ✅ Teste de caso de sucesso
  it('should return all properties', async () => {
    const mockProperties = [{ id: '1', code: 'IM-001' }];
    jest.spyOn(prisma.property, 'findMany').mockResolvedValue(mockProperties as any);

    const result = await service.findAll({});
    expect(result.data).toEqual(mockProperties);
  });

  // ✅ Teste de caso de erro
  it('should throw NotFoundException when property not found', async () => {
    jest.spyOn(prisma.property, 'findUnique').mockResolvedValue(null);

    await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
```

### Frontend - Vitest + React Testing Library
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PropertiesList from './PropertiesList';
import propertiesReducer from '@/features/properties/propertiesSlice';

// ✅ Mock de store
const mockStore = configureStore({
  reducer: { properties: propertiesReducer },
  preloadedState: {
    properties: {
      items: [{ id: '1', code: 'IM-001', ownerName: 'João' }],
      isLoading: false,
      error: null,
    },
  },
});

describe('PropertiesList', () => {
  // ✅ Teste de renderização
  it('should render properties list', () => {
    render(
      <Provider store={mockStore}>
        <PropertiesList />
      </Provider>
    );

    expect(screen.getByText('IM-001')).toBeInTheDocument();
    expect(screen.getByText('João')).toBeInTheDocument();
  });

  // ✅ Teste de interação
  it('should call onEdit when button is clicked', async () => {
    const onEdit = jest.fn();
    render(
      <Provider store={mockStore}>
        <PropertiesList onEdit={onEdit} />
      </Provider>
    );

    const editButton = screen.getByText('Editar');
    await userEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ code: 'IM-001' }));
  });
});
```

---

## 📝 Commit Messages

### Padrão Conventional Commits
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem mudança de lógica)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build, config

**Exemplos**:
```bash
# ✅ Bom
feat(auth): add MFA support with TOTP
fix(gis): correct coordinate projection (SIRGAS 2000)
docs(readme): update installation instructions

# ❌ Ruim
update code
fix bug
changes
```

---

## 🔀 Git Flow

### Branches
- `main` - Produção (sempre estável)
- `develop` - Desenvolvimento (integração)
- `feature/nome-feature` - Nova funcionalidade
- `fix/nome-bug` - Correção de bug
- `hotfix/nome-hotfix` - Correção urgente em produção

### Workflow
```bash
# 1. Criar branch de feature
git checkout develop
git pull origin develop
git checkout -b feature/cadastro-imovel

# 2. Desenvolver (commits frequentes)
git add .
git commit -m "feat(cadastro): add property form validation"

# 3. Push e criar Pull Request
git push origin feature/cadastro-imovel

# 4. Code Review + Merge para develop
# (via GitHub/GitLab PR)

# 5. Release para main
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

---

## 📚 Documentação de Código

### Backend - JSDoc
```typescript
/**
 * Encontra uma propriedade por ID
 * @param id - UUID da propriedade
 * @returns Propriedade encontrada
 * @throws {NotFoundException} Se propriedade não existe
 * @example
 * const property = await service.findById('uuid-123');
 */
async findById(id: string): Promise<Property> {
  // ...
}
```

### Frontend - TSDoc
```typescript
/**
 * Lista de propriedades com filtros e paginação
 * @component
 * @param {PropertiesListProps} props - Props do componente
 * @param {Function} props.onEdit - Callback quando clicar em editar
 * @example
 * <PropertiesList onEdit={(prop) => console.log(prop)} />
 */
export default function PropertiesList({ onEdit }: PropertiesListProps) {
  // ...
}
```

---

## 🚀 Performance

### Backend
- ✅ Usar índices no banco de dados (Prisma migrations)
- ✅ Implementar paginação (evitar queries com SELECT *)
- ✅ Cache com Redis (dados frequentes, TTL curto)
- ✅ Lazy loading de relações (Prisma `include` apenas quando necessário)
- ✅ Otimizar queries N+1 (usar `include` ao invés de queries aninhadas)

### Frontend
- ✅ Code splitting (React.lazy, dynamic imports)
- ✅ Memoização (React.memo, useMemo, useCallback)
- ✅ Virtualização de listas longas (react-window)
- ✅ Debounce em inputs de busca (lodash.debounce)
- ✅ Lazy loading de imagens (IntersectionObserver)

---

## 🔐 Segurança

### Checklist Backend
- [ ] Validar TODOS os inputs (class-validator)
- [ ] Sanitizar saídas (evitar XSS)
- [ ] Usar prepared statements (Prisma protege automaticamente)
- [ ] Limitar rate (NestJS throttler)
- [ ] Validar permissões em TODOS os endpoints (guards)
- [ ] Logs de auditoria (audit_log table)
- [ ] Nunca expor senhas, tokens em logs
- [ ] Usar HTTPS em produção (TLS 1.3)

### Checklist Frontend
- [ ] Sanitizar inputs HTML (DOMPurify)
- [ ] Nunca armazenar senhas em localStorage
- [ ] Usar tokens JWT (HttpOnly cookies idealmente)
- [ ] Validar permissões antes de renderizar componentes
- [ ] Escapar dados de usuários em templates
- [ ] Implementar CSP (Content Security Policy)

---

## 📞 Contato

Dúvidas sobre padrões? Entre em contato:
- **Email**: dev-team@empresa.com.br
- **Slack**: #dev-salesopolis
- **Documentação**: [Wiki interna](https://wiki.empresa.com.br)

---

**Última atualização**: 23/12/2025  
**Versão**: 1.0
