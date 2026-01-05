# 👥 Serviço de Gestão de Usuários - Supabase

Este documento explica como usar o **usersService** e **rolesService** para gerenciar usuários e perfis no sistema.

## 📚 Índice

- [Importação](#importação)
- [Funções de Usuários](#funções-de-usuários)
- [Funções de Roles](#funções-de-roles)
- [Exemplos de Uso](#exemplos-de-uso)
- [Tratamento de Erros](#tratamento-de-erros)

---

## 🔌 Importação

```typescript
import { usersService, rolesService, type User, type Role } from '@/lib/supabase';
```

---

## 👤 Funções de Usuários

### `getAll()`
Busca todos os usuários com suas respectivas roles.

```typescript
const users = await usersService.getAll();
console.log(users);
// [{ id, email, name, role_id, role: { id, name, description, permissions }, ... }]
```

---

### `getById(id: string)`
Busca um usuário específico pelo ID.

```typescript
const user = await usersService.getById('uuid-do-usuario');
console.log(user.name); // "João Silva"
```

---

### `getByEmail(email: string)`
Busca um usuário pelo email.

```typescript
const user = await usersService.getByEmail('joao@example.com');
```

---

### `create(userData)`
Cria um novo usuário no sistema.

```typescript
const newUser = await usersService.create({
  email: 'maria@example.com',
  password: 'senha123',
  name: 'Maria Silva',
  role_id: 'uuid-da-role',
  avatar_url: 'https://example.com/avatar.jpg', // Opcional
  is_active: true, // Opcional (padrão: true)
});
```

**Validações:**
- ✅ Verifica se o email já existe
- ✅ Faz hash da senha automaticamente
- ⚠️ **Importante:** Em produção, use bcrypt no backend!

---

### `update(id: string, userData)`
Atualiza dados de um usuário existente.

```typescript
const updatedUser = await usersService.update('uuid-do-usuario', {
  name: 'Maria Santos',
  email: 'maria.santos@example.com',
  role_id: 'novo-uuid-da-role',
  is_active: false,
});
```

**Validações:**
- ✅ Verifica se o novo email já está em uso por outro usuário

---

### `updatePassword(id: string, newPassword: string)`
Atualiza apenas a senha do usuário.

```typescript
await usersService.updatePassword('uuid-do-usuario', 'novaSenha123');
```

---

### `delete(id: string)`
Exclui um usuário do sistema.

```typescript
await usersService.delete('uuid-do-usuario');
```

**Validações:**
- ⚠️ Não permite excluir o último administrador do sistema

---

### `toggleActive(id: string, isActive: boolean)`
Ativa ou desativa um usuário.

```typescript
// Desativar usuário
await usersService.toggleActive('uuid-do-usuario', false);

// Ativar usuário
await usersService.toggleActive('uuid-do-usuario', true);
```

---

### `updateLastLogin(id: string)`
Atualiza o timestamp do último login.

```typescript
await usersService.updateLastLogin('uuid-do-usuario');
```

---

### `getByRole(roleName: string)`
Busca todos os usuários de um perfil específico.

```typescript
const admins = await usersService.getByRole('admin');
const gestores = await usersService.getByRole('manager');
```

---

### `getActive()`
Busca apenas usuários ativos.

```typescript
const activeUsers = await usersService.getActive();
```

---

## 🎭 Funções de Roles

### `getAll()`
Busca todas as roles disponíveis.

```typescript
const roles = await rolesService.getAll();
```

---

### `getById(id: string)`
Busca uma role pelo ID.

```typescript
const role = await rolesService.getById('uuid-da-role');
```

---

### `getByName(name: string)`
Busca uma role pelo nome.

```typescript
const adminRole = await rolesService.getByName('admin');
```

---

### `create(roleData)`
Cria uma nova role.

```typescript
const newRole = await rolesService.create({
  name: 'moderator',
  description: 'Moderador do Sistema',
  permissions: { read: true, write: true, delete: false },
});
```

---

### `update(id: string, roleData)`
Atualiza uma role existente.

```typescript
const updatedRole = await rolesService.update('uuid-da-role', {
  description: 'Nova descrição',
  permissions: { read: true, write: true, delete: true },
});
```

---

### `delete(id: string)`
Exclui uma role.

```typescript
await rolesService.delete('uuid-da-role');
```

**Validações:**
- ⚠️ Não permite excluir roles que estão em uso por usuários

---

## 💡 Exemplos de Uso

### Criar um Novo Usuário Admin

```typescript
// 1. Buscar a role de admin
const adminRole = await rolesService.getByName('admin');

// 2. Criar o usuário
const newAdmin = await usersService.create({
  email: 'admin@salesopolis.sp.gov.br',
  password: 'senhaSegura123',
  name: 'Administrador Geral',
  role_id: adminRole.id,
  is_active: true,
});

console.log('Admin criado:', newAdmin.name);
```

---

### Listar Todos os Usuários Ativos com suas Roles

```typescript
const activeUsers = await usersService.getActive();

activeUsers.forEach(user => {
  console.log(`${user.name} - ${user.role?.description}`);
});
```

---

### Bloquear Usuário Temporariamente

```typescript
const userId = 'uuid-do-usuario';

// Desativar
await usersService.toggleActive(userId, false);
console.log('Usuário bloqueado!');

// Reativar depois
await usersService.toggleActive(userId, true);
console.log('Usuário desbloqueado!');
```

---

### Atualizar Perfil do Usuário

```typescript
const user = await usersService.getByEmail('joao@example.com');

await usersService.update(user.id, {
  name: 'João Pedro Silva',
  avatar_url: 'https://example.com/new-avatar.jpg',
});

console.log('Perfil atualizado!');
```

---

### Trocar Senha de Usuário

```typescript
const userId = 'uuid-do-usuario';
const newPassword = 'novaSenhaSegura456';

await usersService.updatePassword(userId, newPassword);
console.log('Senha alterada com sucesso!');
```

---

## 🚨 Tratamento de Erros

Todas as funções podem lançar erros. Sempre use `try-catch`:

```typescript
try {
  const user = await usersService.create({
    email: 'usuario@example.com',
    password: 'senha123',
    name: 'Novo Usuário',
    role_id: 'uuid-da-role',
  });
  
  console.log('Usuário criado com sucesso!');
} catch (error: any) {
  console.error('Erro ao criar usuário:', error.message);
  
  // Exibir erro na UI
  if (error.message.includes('Email já cadastrado')) {
    alert('Este email já está em uso!');
  }
}
```

---

## 🔐 Segurança

### ⚠️ Pontos Importantes:

1. **Hash de Senhas**: Atualmente o hash é feito no frontend. Em produção, implemente isso no backend usando uma Edge Function do Supabase.

2. **Validação de Email**: O sistema verifica emails duplicados antes de criar/atualizar.

3. **Proteção de Admin**: Não permite excluir o último administrador.

4. **Proteção de Roles**: Não permite excluir roles em uso.

---

## 🎨 Interface Completa

A página `UsersPage.tsx` já implementa todas essas funções com:

- ✅ Listagem de usuários com busca
- ✅ Criação de novos usuários
- ✅ Edição de usuários existentes
- ✅ Alteração de senha
- ✅ Ativar/Desativar usuários
- ✅ Exclusão de usuários
- ✅ Feedback visual (Snackbar)
- ✅ Validações e tratamento de erros

---

## 📝 Tipos TypeScript

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  role?: Role; // Incluída nas queries com join
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: any;
  created_at: string;
  updated_at: string;
}
```

---

## 🎯 Próximos Passos

1. **Backend Seguro**: Mova o hash de senha para Edge Functions
2. **Auditoria**: Use a tabela `audit_log` para registrar alterações
3. **2FA**: Implemente autenticação de dois fatores
4. **Upload de Avatar**: Integre com Supabase Storage
5. **Permissões Granulares**: Use o campo `permissions` das roles

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique se o schema SQL foi executado no Supabase
2. Confira as credenciais do Supabase em `lib/supabase.ts`
3. Veja o console do navegador para erros específicos
4. Verifique as Row Level Security (RLS) policies no Supabase

---

**📌 Documentação atualizada em:** 2026-01-05
