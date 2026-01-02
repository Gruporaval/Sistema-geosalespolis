# ⚠️ IMPORTANTE - Execute este SQL AGORA!

## 🚨 Você está recebendo erro 401?

Execute este comando no Supabase para corrigir:

1. Acesse: https://zjbghhcsemymbdqnhcdu.supabase.co
2. Vá em **SQL Editor**
3. Cole e execute:

```sql
-- Desabilitar RLS para permitir inserções
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE gis_layers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
```

## ✅ Depois de executar, recarregue a página!

Isso vai resolver o erro:
```
401 Unauthorized
new row violates row-level security policy
```
