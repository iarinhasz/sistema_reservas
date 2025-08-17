import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import ambientesRoutes from './src/api/routes/ambiente_routes.js';
import authRoutes from './src/api/routes/auth.routes.js';
import equipamentoRoutes from './src/api/routes/equipamento.routes.js';
import notificacaoRoutes from './src/api/routes/notificacao.routes.js';
import reservaRoutes from './src/api/routes/reserva.routes.js';
import testingRoutes from './src/api/routes/testing.routes.js';
import usuarioRoutes from './src/api/routes/usuario.routes.js';
import appEmitter from './src/events/appEmitter.js';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

app.use('/api/ambientes', ambientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/equipamentos', equipamentoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/notificacoes', notificacaoRoutes);

console.log('Modo de ambiente atual (NODE_ENV):', process.env.NODE_ENV);
    // app.use('/api/testing', testingRoutes);
    // console.log('Rotas de teste carregadas.');



appEmitter.on('reserva.solicitada', (reserva) => {
  console.log('[Socket.IO Listener] Evento "reserva.solicitada" capturado.');
  io.emit('nova_reserva_pendente', {
    recurso_id: reserva.recurso_id,
    recurso_tipo: reserva.recurso_tipo
  });
});

appEmitter.on('usuario.solicitado', (data) => {
  console.log('[Socket.IO Listener] Evento "usuario.solicitado" capturado.');
  const eventName = 'novo_cadastro_pendente';
  const eventData = { message: 'Nova solicitação de cadastro recebida!' };
  io.emit('novo_cadastro_pendente', { message: 'Nova solicitação de cadastro recebida!' });

  console.log(`[WebSocket] Emitindo evento "${eventName}" para todos os clientes.`);
});

appEmitter.on('avaliacao.nova', (data) => {
    console.log('[Socket.IO Listener] Evento "avaliacao.nova" capturado.');
    io.emit('nova_avaliacao', { ambienteId: data.ambienteId });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} com WebSockets habilitado.`);
});
