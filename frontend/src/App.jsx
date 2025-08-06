
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/public/HomePage.jsx';
import RequestAccessPage from './pages/public/RequestAccessPage';
import LoginPage from './pages/public/Login.jsx';
import AdminLayout from './pages/adm/admLayout.jsx';
import AdmHomePage from './pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from './pages/adm/cadAmbiente.jsx';
import AmbienteDetalhesPage from './pages/adm/AmbienteDetalhesPage.jsx';


import SolicitacoesCadastroPage from './pages/adm/solicitacoesCadastroPage.jsx';
import PublicAmbienteDetalhesPage from './pages/public/PublicAmbienteDetalhesPage.jsx';

function App() {
    return (
        <Routes>
            {/* --- ROTAS PÚBLICAS --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />
            <Route path="/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />

            {/* --- ROTAS DE ADMIN (ANINHADAS) --- */}
            <Route path="/admin" element={<AdminLayout />}>
                {/* As rotas filhas de admin */}
                <Route index element={<AdmHomePage />} />
                <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
                <Route path="solicitacoes-cadastro" element={<SolicitacoesCadastroPage />} />
                <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
            </Route>
        </Routes>
    );
}

export default App;