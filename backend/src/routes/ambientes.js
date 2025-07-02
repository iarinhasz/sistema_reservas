// backend/src/routes/ambientes.js

const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// A função agora recebe o pool do banco E a autenticação do Google
module.exports = (pool, auth) => {
  const calendar = google.calendar({ version: 'v3', auth });

  // ROTA PARA LISTAR TODOS OS AMBIENTES
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM ambientes ORDER BY id ASC');
      res.status(200).json(rows);
    } catch (error) {
      console.error('Erro ao buscar ambientes:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // ROTA PARA CRIAR UM NOVO AMBIENTE E SUA AGENDA NO GOOGLE
  router.post('/', async (req, res) => {
    const { identificacao, nome, tipo } = req.body;

    try {
      // 1. Insere o novo ambiente no nosso banco (ainda sem o google_calendar_id)
      const novoAmbienteResult = await pool.query(
        'INSERT INTO ambientes(identificacao, nome, tipo) VALUES($1, $2, $3) RETURNING *',
        [identificacao, nome, tipo]
      );
      const novoAmbiente = novoAmbienteResult.rows[0];

      // 2. Cria a nova agenda no Google Calendar
      const googleAgendaCriada = await calendar.calendars.insert({
        requestBody: {
          summary: `Agenda - ${nome}` // Ex: "Agenda - Laboratório de Redes"
        }
      });

      const googleCalendarId = googleAgendaCriada.data.id;

      // 3. Atualiza nosso banco com o ID da agenda do Google
      await pool.query(
        'UPDATE ambientes SET google_calendar_id = $1 WHERE id = $2',
        [googleCalendarId, novoAmbiente.id]
      );

      // 4. Retorna o ambiente completo para o frontend
      novoAmbiente.google_calendar_id = googleCalendarId;
      res.status(201).json(novoAmbiente);

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