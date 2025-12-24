# 🚀 Guia de Instalação Rápida

## ⚡ Quick Start (5 minutos)

### Pré-requisitos Obrigatórios
```bash
# Verificar versões
node --version    # v20.x ou superior
npm --version     # v10.x ou superior
docker --version  # v24.x ou superior
git --version     # v2.x ou superior
```

---

## 📦 Instalação Local (Desenvolvimento)

### 1. Clonar Repositório
```bash
git clone <url-do-repositorio>
cd "saas 2"
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env com suas configurações (abrir no editor)
# - DATABASE_URL (ou usar Docker)
# - JWT_SECRET (gerar: openssl rand -base64 32)
# - outros...
```

**Arquivo `.env` mínimo**:
```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/salesopolis?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-aqui-128-bits"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# S3/MinIO
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
S3_BUCKET="salesopolis-uploads"

# Email (opcional para testes)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha"
```

### 3. Subir Banco de Dados (Docker)

```bash
# Na pasta backend/
docker-compose up -d postgres redis minio

# Aguardar 10 segundos para inicialização
sleep 10

# Verificar status
docker-compose ps
```

**Esperado**:
```
NAME                    STATUS
backend-postgres-1      Up
backend-redis-1         Up
backend-minio-1         Up
```

### 4. Executar Migrations

```bash
# Criar estrutura do banco
npx prisma migrate dev --name init

# OU se já tem migrations prontas:
npm run migration:run
```

### 5. Seed de Dados Iniciais

```bash
# Criar roles, permissões e usuário admin
npm run seed
```

**Usuário criado**:
- Email: `admin@salesopolis.sp.gov.br`
- Senha: `Admin@123`

### 6. Iniciar Backend

```bash
# Modo desenvolvimento (hot reload)
npm run start:dev
```

**Acessar**:
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

---

### 7. Configurar Frontend

```bash
# Abrir novo terminal
cd frontend

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Editar .env
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

### 8. Iniciar Frontend

```bash
# Modo desenvolvimento
npm run dev
```

**Acessar**:
- Frontend: http://localhost:5173

---

## 🎉 Pronto! Sistema Rodando

1. Abrir navegador: http://localhost:5173
2. Login:
   - Email: `admin@salesopolis.sp.gov.br`
   - Senha: `Admin@123`
3. Explorar:
   - Dashboard
   - Mapa GIS
   - Cadastro de imóveis
   - Suporte (tickets)

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**:
```bash
# Verificar se Postgres está rodando
docker-compose ps postgres

# Se não estiver, subir novamente
docker-compose up -d postgres

# Verificar logs
docker-compose logs postgres
```

### Erro: "Port 3000 already in use"

**Solução**:
```bash
# Encontrar processo usando porta 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou alterar porta no .env
PORT=3001
```

### Erro: "Migration failed"

**Solução**:
```bash
# Resetar banco de dados (CUIDADO: apaga tudo!)
npx prisma migrate reset

# Recriar estrutura
npx prisma migrate dev

# Re-seed
npm run seed
```

### Frontend não conecta ao Backend

**Solução**:
```bash
# Verificar variável de ambiente
cat frontend/.env

# Deve ter:
VITE_API_URL=http://localhost:3000/api

# Verificar CORS no backend (backend/src/main.ts)
# Deve ter origin: 'http://localhost:5173'
```

---

## 📚 Comandos Úteis

### Backend
```bash
# Desenvolvimento
npm run start:dev

# Build para produção
npm run build

# Executar build
npm run start:prod

# Testes
npm run test

# Prisma Studio (GUI para banco)
npx prisma studio
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

### Docker
```bash
# Subir todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Restart de serviço específico
docker-compose restart postgres

# Remover volumes (apaga dados!)
docker-compose down -v
```

---

## 🎯 Próximos Passos

1. ✅ Sistema rodando localmente
2. 📖 Ler [Documentação Completa](README_COMPLETO.md)
3. 🧪 Executar [Testes de Validação](docs/11-VALIDACAO-ADERENCIA.md)
4. 🚀 [Deploy em Produção](docs/08-OPERACAO.md)

---

## 🆘 Precisa de Ajuda?

- **Documentação**: Ler arquivos em `/docs`
- **Swagger API**: http://localhost:3000/api/docs
- **Issues**: [GitHub Issues](https://github.com/...)
- **Email**: suporte@empresa.com.br

---

**Última atualização**: 23/12/2025  
**Testado em**: Windows 11, macOS 14, Ubuntu 22.04
