import 'dotenv/config';
import express from 'express';
import ambientesRoutes from './src/api/routes/ambiente_routes.js';
import authRoutes from './src/api/routes/auth.routes.js';
import equipamentoRoutes from './src/api/routes/equipamento.routes.js';
import reservaRoutes from './src/api/routes/reserva.routes.js';
import usuarioRoutes from './src/api/routes/usuario.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota principal da API
app.get('/api', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

app.use('/api/ambientes', ambientesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/equipamentos', equipamentoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/usuarios', usuarioRoutes);

if (process.env.NODE_ENV !== 'production') {
    const testingRoutes = (await import('./src/api/routes/testing.routes.js')).default;
    app.use('/api/testing', testingRoutes);
    console.log('Rotas de teste carregadas.');
}


app.listen(PORT, () => {
  console.log(`Servidor do backend rodando na porta ${PORT}`);
});