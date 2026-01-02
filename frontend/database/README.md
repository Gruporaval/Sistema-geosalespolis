# 🗄️ Configuração do Banco de Dados - Supabase

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Sistema Salesópolis
   - **Database Password**: Crie uma senha forte (guarde-a!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"

### 2. Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `database/schema.sql`
4. Cole no editor SQL
5. Clique em "Run" ou pressione `Ctrl + Enter`
6. Aguarde a execução (pode levar alguns segundos)
7. Verifique se não há erros

### 3. Verificar Tabelas Criadas

1. Vá em **Table Editor** (menu lateral)
2. Você deve ver as seguintes tabelas:
   - ✅ roles
   - ✅ users
   - ✅ properties
   - ✅ addresses
   - ✅ privacy_settings
   - ✅ public_data_log
   - ✅ support_tickets
   - ✅ ticket_comments
   - ✅ audit_log
   - ✅ integrations

### 4. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Crie um arquivo `.env.local` na raiz do projeto frontend:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Testar Conexão

Execute o projeto e tente fazer login com as credenciais padrão:

```
Email: admin@salesopolis.sp.gov.br
Senha: admin123
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### 🔐 Autenticação
- **roles**: Perfis de usuário (admin, manager, user, viewer)
- **users**: Usuários do sistema

#### 🏠 Cadastro Imobiliário
- **properties**: Imóveis cadastrados
- **addresses**: Endereços para endereçamento

#### 🔒 Privacidade
- **privacy_settings**: Configurações de privacidade por entidade
- **public_data_log**: Log de publicações de dados

#### 🎫 Suporte
- **support_tickets**: Tickets de suporte
- **ticket_comments**: Comentários dos tickets

#### 📝 Auditoria
- **audit_log**: Log de todas as ações do sistema

#### 🔌 Integrações
- **integrations**: Configurações de integrações externas

## 🔑 Usuário Padrão

O schema cria automaticamente um usuário administrador:

```
Email: admin@salesopolis.sp.gov.br
Senha: admin123
Role: admin
```

**⚠️ IMPORTANTE**: Altere a senha padrão em produção!

## 🛡️ Segurança (RLS - Row Level Security)

O schema já configura políticas de segurança básicas:

- ✅ Usuários só podem ver seus próprios dados
- ✅ Admins podem ver todos os dados
- ✅ Logs de auditoria são protegidos

### Personalizar Políticas

Para ajustar as políticas de segurança, vá em:
**Authentication** → **Policies** no painel do Supabase

## 🔄 Migrações Futuras

Para adicionar novas tabelas ou modificar existentes:

1. Crie um novo arquivo SQL em `database/migrations/`
2. Execute no SQL Editor do Supabase
3. Documente as mudanças

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🆘 Problemas Comuns

### Erro: "relation already exists"
- **Solução**: Algumas tabelas já existem. Delete-as ou use `IF NOT EXISTS`

### Erro: "extension postgis does not exist"
- **Solução**: Execute `CREATE EXTENSION IF NOT EXISTS "postgis";` primeiro

### Erro de permissão
- **Solução**: Verifique se está usando a chave correta (anon key vs service key)

## 📞 Suporte

Para problemas específicos do Supabase:
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
