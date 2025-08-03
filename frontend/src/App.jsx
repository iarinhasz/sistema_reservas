// frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Remova o BrowserRouter daqui

import HomePage from './pages/public/HomePage.jsx';
import RequestAccessPage from './pages/public/RequestAccessPage';
import LoginPage from './pages/public/Login.jsx';
import AdminLayout from './pages/adm/admLayout.jsx';
import AdmHomePage from './pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from './pages/adm/cadAmbiente.jsx';
import AmbienteDetalhesPage from './pages/adm/AmbienteDetalhesPage.jsx';

function App() {
    // Retorne apenas o <Routes>
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdmHomePage />} />
                <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
                <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
            </Route>
        </Routes>
    );
}

export default App;