// backend/src/routes/ambientes.js (VERSÃO CORRIGIDA)

const express = require('express');
const router = express.Router();

// A função agora recebe apenas o 'pool' do banco de dados
module.exports = (pool) => {

  // ROTA PARA LISTAR TODOS OS AMBIENTES (continua igual)
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM ambientes ORDER BY id ASC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao buscar ambientes:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ROTA PARA CRIAR UM NOVO AMBIENTE (versão corrigida)
  router.post('/', async (req, res) => {
    // 1. MUDANÇA AQUI: Capturamos os novos campos do corpo da requisição
    const { identificacao, tipo, status } = req.body;
    
    try {
      // 2. MUDANÇA AQUI: A query SQL agora inclui as novas colunas
      const queryText = 'INSERT INTO ambientes(identificacao, tipo, status) VALUES($1, $2, $3) RETURNING *';
      
      // 3. MUDANÇA AQUI: O array de valores agora inclui todas as variáveis
      const values = [identificacao, tipo, status];

      const { rows } = await pool.query(queryText, values);

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Erro ao criar ambiente:', error);
      if (error.code === '23505') { // Violação de unicidade
        return res.status(409).json({ message: 'Já existe um ambiente com este identificador.' });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  return router;
};