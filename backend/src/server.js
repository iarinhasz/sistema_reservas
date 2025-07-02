// backend/src/server.js

const express = require('express');
const { Pool } = require('pg');
const { google } = require('googleapis');
const path = require('path');

// Importa a função que define as nossas rotas de ambientes
const ambientesRoutes = require('./routes/ambientes');

const app = express();
const PORT = 3000;

// --- Configuração da Conexão com o Banco de Dados ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- Configuração da Autenticação com o Google ---
const KEYFILEPATH = path.join(__dirname, 'sistema-de-reservas-chave-agenda.json'); // <-- SUBSTITUA PELO NOME DO SEU ARQUIVO JSON
const SCOPES = ['https://www.googleapis.com/auth/calendar']; // Permissão completa

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// Middlewares
app.use(express.json());

// --- Rotas da API ---
app.get('/', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

// Diz ao Express para usar o arquivo de rotas de ambientes
// e passa a conexão do banco (pool) e a autenticação do google (auth) para ele.
app.use('/ambientes', ambientesRoutes(pool, auth));

// --- Inicia o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor do backend rodando na porta ${PORT}`);
});