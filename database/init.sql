CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS usuarios (
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'professor', 'aluno')),
    -- ORDEM CORRIGIDA: NOT NULL vem antes de DEFAULT
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'rejeitado')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambientes (
    id SERIAL PRIMARY KEY,
    identificacao VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Disponível'
);

CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    quantidade_total INTEGER NOT NULL CHECK (quantidade_total >= 0),
    ambiente_id INTEGER REFERENCES ambientes(id) ON DELETE SET NULL,
    criado_por_cpf VARCHAR(11) REFERENCES usuarios(cpf) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    usuario_cpf VARCHAR(11) REFERENCES usuarios(cpf) ON DELETE SET NULL,
    recurso_id INTEGER NOT NULL,
    recurso_tipo VARCHAR(50) NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    nota INTEGER,
    comentario TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_recurso_tipo CHECK (recurso_tipo IN ('ambiente', 'equipamento')),
    CONSTRAINT chk_nota_range CHECK (nota IS NULL OR (nota >= 1 AND nota <= 5))

);

-- Inserção de dados para teste (com o campo status corrigido) senha: senha_segura
INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) VALUES
('12345678900', 'Admin Padrão', 'admin@email.com', '$2b$10$d8.WzV7.L1y6j/fH.dY3..DyS.1yZ0.e4K3zL3yW8bJ6hJ8dZ6b.q', 'admin', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) VALUES
('12345678901', 'Aluno Teste', 'aluno@email.com', '$2b$10$d8.WzV7.L1y6j/fH.dY3..DyS.1yZ0.e4K3zL3yW8bJ6hJ8dZ6b.q', 'aluno', 'ativo')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO usuarios (cpf, nome, email, senha, tipo, status) VALUES
('12345678902', 'Professor Teste', 'professor@email.com', '$2b$10$d8.WzV7.L1y6j/fH.dY3..DyS.1yZ0.e4K3zL3yW8bJ6hJ8dZ6b.q', 'professor', 'ativo')
ON CONFLICT (cpf) DO NOTHING;
