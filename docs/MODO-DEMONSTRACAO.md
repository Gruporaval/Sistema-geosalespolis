# Modo de Demonstração - Auto-Login

## 🎯 Objetivo

Este documento explica o funcionamento do **modo de demonstração** do sistema, que permite acesso direto ao dashboard sem necessidade de autenticação via backend.

---

## 🔧 Como Funciona

### 1. Auto-Login Automático

Ao iniciar o frontend, o sistema automaticamente:

1. Verifica se existe um token no `localStorage`
2. Se NÃO existir, executa o `autoLogin()` automaticamente
3. Cria um usuário simulado com perfil de Administrador
4. Salva o token e usuário no `localStorage` e no Redux state
5. Redireciona para `/dashboard`

### 2. Usuário Simulado

```typescript
{
  id: '1',
  name: 'Administrador Demo',
  email: 'admin@salesopolis.sp.gov.br',
  role: 'ADMIN',
  permissions: ['*'], // Todas as permissões
}
```

### 3. Token Simulado

- Token gerado: `mock-jwt-token-{timestamp}`
- Válido apenas para demonstração frontend
- NÃO faz autenticação real no backend

---

## 📂 Arquivos Modificados

### 1. `frontend/src/features/auth/authSlice.ts`

**Adicionado reducer `autoLogin`:**

```typescript
autoLogin: (state) => {
  const mockUser: User = {
    id: '1',
    name: 'Administrador Demo',
    email: 'admin@salesopolis.sp.gov.br',
    role: 'ADMIN',
    permissions: ['*'],
  };
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  state.user = mockUser;
  state.accessToken = mockToken;
  state.refreshToken = mockToken;
  state.isAuthenticated = true;
  state.requiresMfa = false;
  state.isLoading = false;
  state.error = null;

  localStorage.setItem('accessToken', mockToken);
  localStorage.setItem('refreshToken', mockToken);
  localStorage.setItem('user', JSON.stringify(mockUser));
}
```

### 2. `frontend/src/App.tsx`

**Modificado `useEffect` para auto-login:**

```typescript
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    dispatch(autoLogin());
  }
}, []);
```

### 3. `frontend/src/components/layout/Header.tsx`

**Botão "Sair" comentado:**

```typescript
{/* Logout desabilitado - Auto-login ativo para demonstração */}
{/* <MenuItem onClick={handleLogout}>...</MenuItem> */}
```

### 4. Rotas Ajustadas

- `/login` - Disponível apenas via URL direta (oculto)
- `/` - Redireciona automaticamente para `/dashboard`
- Todas as rotas protegidas funcionam normalmente

---

## 🚀 Vantagens do Modo Demo

### ✅ Para Desenvolvimento
- Não precisa rodar o backend
- Testes rápidos de UI/UX
- Prototipagem acelerada

### ✅ Para Demonstração
- Acesso imediato ao sistema
- Não requer credenciais
- Apresentação fluida para clientes
- Ideal para pregões/licitações

### ✅ Para Testes
- Teste de componentes isolados
- Validação de rotas e navegação
- Verificação de permissões de UI

---

## 🔒 Limitações

⚠️ **IMPORTANTE:** Este modo é apenas para **demonstração e desenvolvimento**!

### O que NÃO funciona:
- ❌ Chamadas reais à API (retornarão erro 404/500)
- ❌ Persistência de dados (tudo é mock)
- ❌ Validações de backend
- ❌ Autenticação real

### O que FUNCIONA:
- ✅ Navegação completa entre páginas
- ✅ Layout e componentes visuais
- ✅ Controles de permissão no frontend
- ✅ Estado do Redux (simulado)

---

## 🔄 Como Desativar (Voltar ao Modo Normal)

### Opção 1: Remover Auto-Login

Em `frontend/src/App.tsx`, comente o auto-login:

```typescript
useEffect(() => {
  // Auto-login desativado
  // const token = localStorage.getItem('accessToken');
  // if (!token) {
  //   dispatch(autoLogin());
  // }
  
  // Voltar ao modo normal
  if (isAuthenticated) {
    dispatch(getCurrentUser());
  }
}, [dispatch, isAuthenticated]);
```

### Opção 2: Limpar localStorage

No console do navegador (F12):

```javascript
localStorage.clear();
location.reload();
```

### Opção 3: Acessar `/login` Diretamente

Navegar para: `http://localhost:5173/login`

---

## 📋 Checklist de Uso

### Para Demonstração em Pregão/Licitação:

- [x] Auto-login ativado
- [x] Backend NÃO precisa estar rodando
- [x] Usuário simulado com todas as permissões
- [x] Botão "Sair" oculto
- [x] Navegação completa funcional
- [x] UI/UX totalmente apresentável

### Para Produção:

- [ ] Auto-login DESATIVADO
- [ ] Backend rodando e conectado
- [ ] Autenticação real via JWT
- [ ] Botão "Sair" visível
- [ ] Validações de API ativas
- [ ] Logs e auditoria funcionando

---

## 🎨 Interface em Modo Demo

### Tela Inicial
- Carrega automaticamente com usuário logado
- Dashboard exibido imediatamente
- Todos os menus acessíveis

### Header
- Exibe: "Administrador Demo"
- Role: "ADMIN"
- Avatar: "A" (primeira letra do nome)
- Menu: Perfil e Configurações (Sair oculto)

### Sidebar
- Todos os módulos visíveis:
  - Dashboard
  - Mapa GIS
  - Recadastramento
  - Endereçamento
  - Suporte

---

## 💡 Casos de Uso

### 1. Apresentação para Cliente
```
Cenário: Demonstrar o sistema sem backend
Ação: Abrir navegador, acessar URL
Resultado: Sistema carrega direto no dashboard
```

### 2. Desenvolvimento Frontend
```
Cenário: Trabalhar em componentes UI
Ação: npm run dev (apenas frontend)
Resultado: Desenvolvimento sem depender do backend
```

### 3. Testes de Navegação
```
Cenário: Validar rotas e guardas
Ação: Navegar entre todas as páginas
Resultado: Validação completa de fluxo
```

---

## 🔗 Arquivos Relacionados

- `frontend/src/features/auth/authSlice.ts` - Lógica de auto-login
- `frontend/src/App.tsx` - Ativação do auto-login
- `frontend/src/components/layout/Header.tsx` - UI ajustada
- `frontend/src/components/guards/PrivateRoute.tsx` - Guarda de rotas

---

## 📝 Observações

1. **Não usar em produção** - Apenas para demo/dev
2. **Token expira** ao fechar/recarregar (será recriado automaticamente)
3. **Dados não persistem** - Tudo é simulado no frontend
4. **Backend opcional** - Frontend funciona standalone

---

**Criado em:** 24/12/2025  
**Modo:** Demonstração / Desenvolvimento  
**Status:** ✅ Ativo
