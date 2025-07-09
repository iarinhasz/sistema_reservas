-- Habilita a extensão necessária para a constraint de exclusão de sobreposição de datas
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS usuarios (
    cpf VARCHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'professor', 'aluno')), -- 'aluno', 'professor', 'administrador'
    status VARCHAR(20) DEFAULT 'pendente' NOT NULL CHECK (status IN ('pendente', 'ativo', 'rejeitado')),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ambientes (
    id SERIAL PRIMARY KEY,
    identificacao VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Disponível'
);

CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    quantidade_total INTEGER NOT NULL CHECK (quantidade_total >= 0),
    ambiente_id INTEGER NOT NULL REFERENCES ambientes(id) ON DELETE SET NULL 
);

CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    usuario_cpf VARCHAR(11) REFERENCES usuarios(cpf) ON DELETE SET NULL,
    recurso_id INTEGER NOT NULL,
    recurso_tipo VARCHAR(50) NOT NULL,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente, aprovada, rejeitada, cancelada
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_recurso_tipo CHECK (recurso_tipo IN ('ambiente', 'equipamento'))
);

-- Inserção de dados para teste
INSERT INTO usuarios (cpf, nome, email, senha, tipo) VALUES
('12345678900', 'Admin Padrão', 'admin@email.com', 'senha_hash_segura', 'administrador')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO ambientes(identificacao, tipo, status) VALUES
('Sala de Reuniões A-101', 'Sala', 'Disponível');

INSERT INTO ambientes(identificacao, tipo, status) VALUES
('Laboratório de Graduação G1', 'Laboratório', 'Disponível');

INSERT INTO ambientes(identificacao, tipo, status) VALUES
('Auditório Principal', 'Auditório', 'Disponível');


INSERT INTO usuarios (cpf, nome, email, senha, tipo) VALUES
('11122233344', 'Professor Xavier', 'professor@email.com', 'senha_professor', 'professor')
ON CONFLICT (cpf) DO NOTHING;


INSERT INTO usuarios (cpf, nome, email, senha, tipo) VALUES
('55566677788', 'Jean Grey', 'aluno@email.com', 'senha_aluno', 'aluno')
ON CONFLICT (cpf) DO NOTHING;
