// backend/src/server.js

const express = require('express');
const app = express();
const PORT = 3000; // A porta que nosso contêiner vai usar

// Rota principal que responde com "Olá Mundo"
app.get('/', (req, res) => {
  res.send('Olá Mundo! Este é o backend do Sistema de Reservas.');
});

// Inicia o servidor e fica "ouvindo" na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});