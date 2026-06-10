# GED Sistema - Gestão Eletrônica de Documentos com OCR

Sistema web para digitalização estruturada, indexação automatizada via OCR, controle de versionamento e armazenamento seguro em nuvem, destinado a pequenas e médias organizações.

## Tecnologias

- **Frontend:** React.js v18 + React Router v6
- **Backend:** Node.js v20 LTS + Express.js v4
- **Banco de Dados:** PostgreSQL v16 (full-text search nativo)
- **OCR:** Tesseract.js v5 (suporte a português)
- **Armazenamento:** AWS S3 (criptografia AES-256)
- **Autenticação:** JWT + bcrypt + RBAC

## Estrutura do Projeto

```
ged-sistema/
├── client/                     # Frontend React.js v18
│   └── src/
│       ├── components/
│       │   ├── Auth/           # LoginForm, ProtectedRoute
│       │   ├── Dashboard/      # Dashboard, StatsCards, MonthlyChart
│       │   ├── Documents/      # DocumentList, UploadForm, SearchPage, DocumentViewer
│       │   ├── Folders/        # FolderTree, FolderManager
│       │   ├── Users/          # UserTable, UserForm
│       │   ├── Reports/        # AuditLog
│       │   ├── Notifications/  # NotificationList
│       │   └── Layout/         # Layout, Sidebar, TopBar
│       ├── services/           # api.js (Axios)
│       ├── context/            # AuthContext.jsx (JWT)
│       ├── hooks/              # useDocuments, useNotifications
│       └── App.jsx             # Rotas protegidas (RBAC)
├── server/                     # Backend Node.js v20 + Express v4
│   └── src/
│       ├── controllers/        # authController, documentController
│       ├── routes/             # auth, document, folder, user, report, notification
│       ├── middleware/         # authMiddleware (JWT+RBAC), auditMiddleware
│       ├── services/           # ocrService (Tesseract.js)
│       ├── config/             # database.js (pg Pool), aws.js (S3Client)
│       ├── jobs/               # notificationScheduler.js
│       └── app.js              # Entry point Express
├── database/
│   └── schema.sql              # 7 tabelas PostgreSQL v16
├── docker-compose.yml
├── .env.example
└── README.md
```

## Instalação

### Com Docker (recomendado)

```bash
git clone https://github.com/Ygorsantana3/ged-sistema.git
cd ged-sistema
cp .env.example .env
docker-compose up -d
```

### Sem Docker

```bash
# Backend
cd server
cp ../.env.example ../.env
npm install
npm run dev

# Frontend (outro terminal)
cd client
npm install
npm start
```

### Banco de Dados

```bash
psql -U postgres -c "CREATE DATABASE ged_sistema;"
psql -U postgres -d ged_sistema -f database/schema.sql
```

## Funcionalidades (Requisitos Funcionais)

| RF   | Funcionalidade                          |
|------|-----------------------------------------|
| RF01 | Cadastro de usuários com perfis RBAC    |
| RF02 | Upload de documentos (PDF/JPEG/PNG/TIFF)|
| RF03 | Processamento automático de OCR         |
| RF04 | Indexação por metadados                 |
| RF05 | Busca full-text (PostgreSQL GIN)        |
| RF06 | Controle de versionamento               |
| RF07 | Visualização/download no navegador      |
| RF08 | Painel administrativo e auditoria       |
| RF09 | Organização hierárquica de pastas       |
| RF10 | Notificações de vencimento              |

## Perfis de Acesso (RBAC)

- **Administrador:** acesso total (CRUD usuários, categorias, relatórios)
- **Operador:** upload, edição de metadados, exclusão lógica
- **Consultor:** somente leitura

## Autor

Ygor Moreira Santana - Projeto Integrador II - ADS
