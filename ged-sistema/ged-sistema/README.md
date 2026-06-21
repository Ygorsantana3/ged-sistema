# GED Sistema - Gestão Eletrônica de Documentos com OCR

Sistema web para digitalização estruturada, indexação automatizada via OCR, controle de versionamento e armazenamento seguro, destinado a pequenas e médias organizações.

## Tecnologias

- **Frontend:** React.js v18 + React Router v6
- **Backend:** Node.js + Express.js v4
- **Banco de Dados:** PostgreSQL v16 (full-text search nativo via GIN)
- **OCR:** Tesseract.js v5 (suporte a português)
- **Armazenamento:** Sistema de arquivos local (`server/uploads/`)
- **Autenticação:** JWT + bcrypt + RBAC (3 perfis)
- **Hospedagem do BD:** Neon PostgreSQL (cloud)

## Estrutura do Projeto

```
ged-sistema/
├── client/                        # Frontend React.js v18
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Auth/              # LoginForm, ProtectedRoute
│       │   ├── Dashboard/         # Dashboard, StatsCards, MonthlyChart
│       │   ├── Documents/         # DocumentList, UploadForm, SearchPage,
│       │   │                      # DocumentViewer, MetadataEditor, VersionList
│       │   ├── Folders/           # FolderTree, FolderManager
│       │   ├── Users/             # UserTable, UserForm
│       │   ├── Reports/           # AuditLog (com export CSV)
│       │   ├── Notifications/     # NotificationList
│       │   └── Layout/            # Layout, Sidebar, TopBar
│       ├── services/              # api.js (Axios)
│       ├── context/               # AuthContext.jsx (JWT)
│       ├── hooks/                 # useDocuments, useNotifications
│       ├── index.css              # Tema escuro completo
│       ├── index.js               # Entry point React
│       └── App.jsx                # Rotas protegidas (RBAC)
├── server/                        # Backend Node.js + Express v4
│   ├── uploads/                   # Arquivos enviados (local)
│   └── src/
│       ├── controllers/           # authController, documentController
│       ├── routes/                # auth, document, folder, category,
│       │                          # user, report, notification
│       ├── middleware/            # authMiddleware (JWT+RBAC), auditMiddleware
│       ├── services/              # ocrService (Tesseract.js)
│       ├── config/                # database.js (pg Pool + SSL), storage.js
│       ├── jobs/                  # notificationScheduler.js
│       └── app.js                 # Entry point Express
├── database/
│   └── schema.sql                 # 7 tabelas PostgreSQL v16
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Instalação

### Pré-requisitos

- Node.js v18+ e npm
- Banco PostgreSQL (local ou [Neon](https://neon.tech))

### 1. Clonar o repositório

```bash
git clone https://github.com/Ygorsantana3/ged-sistema.git
cd ged-sistema/ged-sistema/ged-sistema
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (`ged-sistema/ged-sistema/ged-sistema/.env`):

```env
NODE_ENV=development
PORT=3001

# Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ged_sistema
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_SSL=false

# JWT
JWT_SECRET=sua-chave-secreta-jwt
JWT_EXPIRES=8h

# Cliente
CLIENT_URL=http://localhost:3000
```

> Para usar o **Neon PostgreSQL**, altere `DB_HOST` para o host do Neon e defina `DB_SSL=true`.

### 3. Criar o banco de dados

**Com PostgreSQL local:**
```bash
psql -U postgres -c "CREATE DATABASE ged_sistema;"
psql -U postgres -d ged_sistema -f database/schema.sql
```

**Com Neon (via Node.js):**
```bash
cd server && npm install
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: 'SUA_CONNECTION_STRING', ssl: { rejectUnauthorized: false } });
pool.query(fs.readFileSync('../database/schema.sql','utf8')).then(() => { console.log('Schema criado!'); pool.end(); });
"
```

### 4. Instalar dependências e iniciar

```bash
# Backend
cd server
npm install
node src/app.js

# Frontend (outro terminal)
cd client
npm install
npm start
```

### 5. Acessar o sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

### Credenciais padrão

| Campo | Valor |
|-------|-------|
| E-mail | `admin@gedsistema.com` |
| Senha | `admin123` |

## Funcionalidades

### Requisitos Funcionais

| RF   | Funcionalidade                                    | Status |
|------|---------------------------------------------------|--------|
| RF01 | Cadastro de usuários com perfis RBAC              | ✅     |
| RF02 | Upload de documentos (PDF/JPEG/PNG/TIFF, até 50MB)| ✅     |
| RF03 | Processamento automático de OCR (Tesseract.js)    | ✅     |
| RF04 | Indexação e edição de metadados                   | ✅     |
| RF05 | Busca full-text com PostgreSQL GIN                | ✅     |
| RF06 | Controle de versionamento de documentos           | ✅     |
| RF07 | Visualização/preview e download no navegador      | ✅     |
| RF08 | Painel administrativo, auditoria e export CSV     | ✅     |
| RF09 | Organização hierárquica de pastas                 | ✅     |
| RF10 | Notificações de vencimento de documentos          | ✅     |

### Telas do Sistema

- **Login** — Autenticação com JWT
- **Dashboard** — Cards de estatísticas, gráfico mensal de uploads, atividade recente, barra de armazenamento
- **Upload** — Drag & drop com seleção de categoria e pasta via dropdown
- **Busca** — Lista todos os documentos ao abrir, busca full-text, filtros (Todos/PDF/Imagem/Recentes)
- **Visualizador** — Preview real de PDF (iframe) e imagens, zoom, botões de visualizar/baixar/inativar
- **Metadados** — Edição de título, autor, descrição, datas, palavras-chave
- **Versões** — Histórico de versões com upload de nova versão
- **Pastas** — Árvore hierárquica com criação de subpastas
- **Usuários** — CRUD completo com atribuição de perfil
- **Relatórios** — Logs de auditoria com filtros por data/ação e exportação CSV
- **Notificações** — Alertas de vencimento com filtros (Todas/Não lidas/Vencimentos/Sistema)

### Inativação de Documentos

Os documentos não são excluídos permanentemente. O sistema possui exclusão lógica:
- **Inativar** — O documento fica oculto das listagens normais
- **Reativar** — O documento volta a aparecer nas listagens
- Disponível na lista de documentos (aba Ativos/Inativos) e no visualizador

## Perfis de Acesso (RBAC)

| Perfil         | Permissões                                               |
|----------------|----------------------------------------------------------|
| Administrador  | Acesso total: CRUD usuários, categorias, relatórios      |
| Operador       | Upload, edição de metadados, inativação de documentos    |
| Consultor      | Somente leitura e download                               |

## API — Endpoints Principais

| Método | Rota                            | Descrição                    |
|--------|---------------------------------|------------------------------|
| POST   | `/api/auth/login`               | Login (retorna JWT)          |
| POST   | `/api/auth/register`            | Cadastrar usuário (admin)    |
| GET    | `/api/documents`                | Listar documentos            |
| GET    | `/api/documents?status=inativo` | Listar documentos inativos   |
| POST   | `/api/documents/upload`         | Upload de documento          |
| GET    | `/api/documents/search?q=`      | Busca full-text              |
| GET    | `/api/documents/:id`            | Detalhes do documento        |
| GET    | `/api/documents/:id/download`   | URL de download              |
| PUT    | `/api/documents/:id/metadata`   | Editar metadados             |
| PUT    | `/api/documents/:id/inactivate` | Inativar documento           |
| PUT    | `/api/documents/:id/reactivate` | Reativar documento           |
| GET    | `/api/documents/:id/versions`   | Listar versões               |
| POST   | `/api/documents/:id/versions`   | Criar nova versão            |
| GET    | `/api/folders`                  | Listar pastas                |
| POST   | `/api/folders`                  | Criar pasta                  |
| GET    | `/api/categories`               | Listar categorias            |
| GET    | `/api/users`                    | Listar usuários (admin)      |
| GET    | `/api/reports/stats`            | Estatísticas do dashboard    |
| GET    | `/api/reports/audit`            | Logs de auditoria (admin)    |
| GET    | `/api/reports/audit/csv`        | Exportar auditoria em CSV    |
| GET    | `/api/notifications`            | Listar notificações          |
| GET    | `/api/health`                   | Health check da API          |

## Banco de Dados

O schema PostgreSQL v16 contém 7 tabelas:

- `users` — Usuários com perfis RBAC (admin, operador, consultor)
- `categories` — Categorias de documentos (Contratos, Fiscal, Ofícios, Relatórios, RH)
- `folders` — Pastas hierárquicas (auto-referência via `pasta_pai_id`)
- `documents` — Documentos com metadados, OCR, versionamento e exclusão lógica
- `versions` — Histórico de versões de cada documento
- `audit_logs` — Logs de auditoria (upload, download, edit, delete, login)
- `notifications` — Notificações de vencimento e sistema

Índices GIN para busca full-text em português e busca por palavras-chave.

## Autor

**Ygor Moreira Santana** — Projeto Integrador II — Análise e Desenvolvimento de Sistemas
