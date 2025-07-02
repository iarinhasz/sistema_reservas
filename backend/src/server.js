// backend/src/server.js

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// --- Configuração da Conexão com o Banco de Dados ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware essencial para que o Express entenda JSON no corpo das requisições POST
app.use(express.json());

// --- Rotas da API ---

app.get('/', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

// ROTA PARA LISTAR TODOS OS USUÁRIOS
app.get('/usuarios', async (req, res) => {
  try {
    // Selecionamos apenas os campos seguros para retornar. Nunca retorne a senha!
    const { rows } = await pool.query('SELECT cpf, nome, email, data_criacao FROM usuarios');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTA PARA CRIAR UM NOVO USUÁRIO
app.post('/usuarios', async (req, res) => {
  // Pega os dados do corpo (body) da requisição
  const { cpf, nome, email, senha } = req.body;

  // Em um projeto real, aqui você faria a validação dos dados e o HASH da senha com bcrypt

  try {
    const queryText = 'INSERT INTO usuarios(cpf, nome, email, senha) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [cpf, nome, email, senha];

    const { rows } = await pool.query(queryText, values);

    // Retorna o usuário criado com o status 201 (Created)
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor do backend rodando na porta ${PORT}`);
});