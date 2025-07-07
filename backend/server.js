import express from 'express';
import ambientesRoutes from './src/api/routes/ambiente_routes.js';
import authRoutes from './src/api/routes/auth.routes.js'; 



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota principal da API
app.get('/api', (req, res) => {
  res.send('Backend do Sistema de Reservas está no ar!');
});

app.use('/api/ambientes', ambientesRoutes);
app.use('/api/auth', authRoutes); 

app.listen(PORT, () => {
  console.log(`Servidor do backend rodando na porta ${PORT}`);
});