# Frontend - Sistema de Cadastro Salesópolis

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna
- **Material-UI (MUI)** - Componentes UI
- **Redux Toolkit** - Gerenciamento de estado
- **React Router** - Roteamento
- **Leaflet** - Mapas interativos
- **Chart.js** - Gráficos e visualizações
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Zod** - Validação de esquemas

## 📁 Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── guards/          # Guards de rota (PrivateRoute, PermissionGuard)
│   │   └── layout/          # Componentes de layout (Header, Sidebar)
│   ├── features/            # Slices Redux por domínio
│   │   ├── auth/            # Autenticação
│   │   ├── map/             # Mapa GIS
│   │   ├── properties/      # Propriedades
│   │   ├── addresses/       # Endereços
│   │   ├── dashboard/       # Dashboard
│   │   └── tickets/         # Suporte
│   ├── hooks/               # Custom hooks
│   ├── layouts/             # Layouts principais (MainLayout, AuthLayout)
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços e APIs
│   ├── store.ts             # Configuração Redux
│   ├── theme.ts             # Tema Material-UI
│   ├── App.tsx              # Componente raiz
│   └── main.tsx             # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🔐 Autenticação

O sistema utiliza JWT com refresh token. O fluxo:

1. **Login**: POST `/api/auth/login` → retorna `accessToken` e `refreshToken`
2. **Tokens salvos** no `localStorage`
3. **Interceptor Axios** adiciona `Authorization: Bearer <token>` em todas as requisições
4. **Auto-refresh**: Se 401, tenta renovar token automaticamente
5. **Logout**: Limpa tokens e redireciona para `/login`

### MFA (Multi-Factor Authentication)

Se usuário tem MFA ativado:
- Login retorna `requiresMfa: true`
- UI mostra campo para código TOTP
- Reenvio com `mfaCode` completa autenticação

## 🗺️ Mapa GIS

Utiliza **Leaflet** com camadas configuráveis:

- **Base**: OpenStreetMap
- **Camadas**:
  - Imóveis (pontos/polígonos)
  - Endereços (marcadores)
  - PGV (zonas de valor)
  - Bairros (polígonos)

### Funcionalidades
- ✅ Zoom/pan
- ✅ Ativar/desativar camadas
- ✅ Seleção de features
- ✅ Popup com informações
- 🟡 Desenho de geometrias (em desenvolvimento)
- 🟡 Medição de distância/área (em desenvolvimento)

## 📊 Dashboard

KPIs principais:
- Total de propriedades
- Propriedades com endereço
- Propriedades com geometria
- Progresso de recadastramento

Gráficos:
- Pizza: Propriedades por tipo
- Barras: Propriedades por bairro

## 🔑 Controle de Acesso (RBAC)

### Uso no Código

```tsx
import PermissionGuard from '@/components/guards/PermissionGuard';

<PermissionGuard permission="properties:write">
  <Button onClick={handleEdit}>Editar</Button>
</PermissionGuard>

// Ou com hook
import { usePermissions } from '@/hooks/usePermissions';

const { hasPermission } = usePermissions();
if (hasPermission('properties:delete')) {
  // Mostrar botão deletar
}
```

### Permissões Disponíveis

- `properties:read` - Visualizar imóveis
- `properties:write` - Criar/editar imóveis
- `properties:delete` - Deletar imóveis
- `addresses:read` - Visualizar endereços
- `addresses:write` - Criar/editar endereços
- `gis:read` - Visualizar mapa
- `gis:write` - Editar geometrias
- `tickets:read` - Visualizar tickets
- `tickets:write` - Criar/responder tickets
- `dashboard:read` - Visualizar dashboard
- `audit:read` - Visualizar logs de auditoria
- `users:manage` - Gerenciar usuários

## 🎨 Temas e Estilos

Configuração em `src/theme.ts`:

```tsx
import { theme } from './theme';

// Cores primárias
theme.palette.primary.main = '#1976d2';
theme.palette.secondary.main = '#dc004e';

// Customização de componentes
MuiButton: {
  defaultProps: { disableElevation: true },
}
```

## 📡 Chamadas de API

Todas as chamadas passam pelo cliente Axios configurado em `src/services/api.ts`:

```tsx
import api from '@/services/api';

// GET
const response = await api.get('/cadastro/properties');

// POST
const response = await api.post('/cadastro/properties', data);

// PATCH
const response = await api.patch('/cadastro/properties/:id', data);

// DELETE
await api.delete('/cadastro/properties/:id');
```

Erros são tratados globalmente:
- **401**: Tenta refresh token, se falhar → logout
- **403**: Toast de erro "Sem permissão"
- **Outros**: Toast com mensagem do servidor

## 🧪 Testes (Planejado)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📦 Build e Deploy

```bash
# Build otimizada
npm run build

# Saída em /dist
# Fazer deploy do conteúdo de /dist em:
# - S3 + CloudFront (AWS)
# - Azure Static Web Apps
# - Vercel/Netlify
# - Nginx (servir estáticos)
```

### Variáveis de Ambiente (Produção)

```env
VITE_API_URL=https://api.salesopolis.gov.br
```

## 🚀 Próximas Implementações

### Alta Prioridade
- [ ] Página de detalhes do imóvel (histórico, fotos)
- [ ] Formulário de criação/edição de imóvel
- [ ] Página de endereços com geocodificação
- [ ] Página de tickets completa

### Média Prioridade
- [ ] Ferramentas de desenho no mapa
- [ ] Medição de distância/área
- [ ] Exportação de dados (CSV/XLSX)
- [ ] Relatórios PDF

### Baixa Prioridade
- [ ] Notificações em tempo real (WebSocket)
- [ ] Dark mode
- [ ] Internacionalização (i18n)
- [ ] PWA (offline mode)

## 📚 Documentação Adicional

- [Material-UI Docs](https://mui.com/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Leaflet Docs](https://leafletjs.com/)
- [React Router Docs](https://reactrouter.com/)

---

**Desenvolvido para a Prefeitura da Estância Turística de Salesópolis**  
**Edital Pregão Eletrônico nº 16/2025**
