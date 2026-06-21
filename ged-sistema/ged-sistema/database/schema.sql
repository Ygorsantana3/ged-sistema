-- GED Sistema - Schema do Banco de Dados PostgreSQL v16
-- Sistema de Gestão Eletrônica de Documentos com OCR

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'operador', 'consultor');
CREATE TYPE user_status AS ENUM ('ativo', 'inativo');
CREATE TYPE ocr_status AS ENUM ('pendente', 'processando', 'processado', 'erro');
CREATE TYPE audit_action AS ENUM ('upload', 'download', 'edit', 'delete', 'login', 'logout', 'search', 'permission', 'ocr');

-- Tabela de Usuários (RF01)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil user_role NOT NULL DEFAULT 'consultor',
    status user_status NOT NULL DEFAULT 'ativo',
    ultimo_login TIMESTAMP,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de Categorias
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabela de Pastas (RF09)
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    pasta_pai_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    criado_por UUID REFERENCES users(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(nome, pasta_pai_id)
);

-- Tabela de Documentos (RF02, RF03, RF04)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categories(id),
    pasta_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    autor VARCHAR(255),
    palavras_chave TEXT[],
    formato VARCHAR(10) NOT NULL,
    tamanho BIGINT NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(1000),
    ocr_texto TEXT,
    ocr_status ocr_status NOT NULL DEFAULT 'pendente',
    ocr_confianca DECIMAL(5,2),
    data_documento DATE,
    data_validade DATE,
    versao_atual INTEGER NOT NULL DEFAULT 1,
    excluido BOOLEAN NOT NULL DEFAULT FALSE,
    excluido_em TIMESTAMP,
    criado_por UUID REFERENCES users(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice full-text search (RF05)
CREATE INDEX idx_documents_fts ON documents
    USING GIN (to_tsvector('portuguese', COALESCE(titulo, '') || ' ' || COALESCE(ocr_texto, '') || ' ' || COALESCE(descricao, '')));

CREATE INDEX idx_documents_palavras_chave ON documents USING GIN (palavras_chave);
CREATE INDEX idx_documents_categoria ON documents(categoria_id);
CREATE INDEX idx_documents_pasta ON documents(pasta_id);
CREATE INDEX idx_documents_validade ON documents(data_validade) WHERE data_validade IS NOT NULL AND excluido = FALSE;

-- Tabela de Versões (RF06)
CREATE TABLE versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    numero_versao INTEGER NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    tamanho BIGINT NOT NULL,
    notas TEXT,
    criado_por UUID REFERENCES users(id),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(document_id, numero_versao)
);

-- Tabela de Logs de Auditoria (RF08, RN07)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES users(id),
    acao audit_action NOT NULL,
    documento_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    detalhes JSONB,
    ip_address INET,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX idx_audit_logs_acao ON audit_logs(acao);
CREATE INDEX idx_audit_logs_data ON audit_logs(criado_em);

-- Tabela de Notificações (RF10)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    documento_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_usuario ON notifications(usuario_id, lida);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER tr_documents_updated BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Dados iniciais
INSERT INTO users (nome, email, senha_hash, perfil) VALUES
    ('Administrador', 'admin@gedsistema.com', '$2b$10$i08iCQ2wzA8q4mDXdYzvwOs0ZbAsnBxX9cvaoSfJthVdLfZ5SvZcy', 'admin');

INSERT INTO categories (nome, descricao) VALUES
    ('Contratos', 'Contratos e aditivos'),
    ('Fiscal', 'Notas fiscais e documentos tributários'),
    ('Ofícios', 'Ofícios e correspondências oficiais'),
    ('Relatórios', 'Relatórios gerenciais e operacionais'),
    ('RH', 'Documentos de recursos humanos');
