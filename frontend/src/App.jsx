import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
// Crie esses outros componentes depois
// import Dashboard from './pages/Dashboard'; 
// import SolicitarCadastro from './pages/SolicitarCadastro';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                {/* <Route path="/solicitar-cadastro" element={<SolicitarCadastro />} /> */}
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                {/* Adicione outras rotas aqui */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;