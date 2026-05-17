# GED Sistema - Gestão Eletrônica de Documentos com OCR

Sistema web para digitalização estruturada, indexação automatizada via OCR, controle de versionamento e armazenamento seguro em nuvem, destinado a pequenas e médias organizações.

## Tecnologias

- **Frontend:** React.js v18
- **Backend:** Node.js v20 LTS + Express.js v4
- **Banco de Dados:** PostgreSQL v16
- **OCR:** Tesseract.js v5
- **Armazenamento:** AWS S3
- **Autenticação:** JWT + bcrypt

## Instalação

```bash
# Clonar repositório
git clone https://github.com/Ygorsantana3/ged-sistema.git
cd ged-sistema

# Com Docker
docker-compose up -d

# Sem Docker
cd server && npm install && npm run dev
cd client && npm install && npm start
```

## Estrutura do Projeto

```
ged-sistema/
├── client/          # Frontend React.js
├── server/          # Backend Node.js/Express
├── database/        # Schema SQL
└── docker-compose.yml
```

## Autor

Ygor Moreira Santana - Projeto Integrador II - ADS
