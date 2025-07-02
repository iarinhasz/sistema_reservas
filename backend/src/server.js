const express = require('express');
const { Pool } = require('pg');

const ambientesRoutes = require('./routes/ambientes');
const reservasRoutes = require('./routes/reservas'); // Supondo que você o tenha

const app = express();
const PORT = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// --- Rotas da API ---
app.get('/', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

// Note que agora só passamos o 'pool' para as rotas
app.use('/ambientes', ambientesRoutes(pool));
app.use('/reservas', reservasRoutes(pool));


app.listen(PORT, () => {
  console.log(`Servidor do backend rodando na porta ${PORT}`);
});