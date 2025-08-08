import React from 'react';
import AppRouter from '../../frontend/src/routes/AppRouter'; // Importa o roteador
import './App.css'; // Seus estilos globais

// A única responsabilidade do App.jsx é renderizar o componente que gerencia as rotas.
function App() {
  return (
    <AppRouter />
  );
}

export default App;