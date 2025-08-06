import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/public/HomePage.jsx';
import RequestAccessPage from './pages/public/RequestAccessPage';
import LoginPage from './pages/public/Login.jsx';

import AdminLayout from './pages/adm/admLayout.jsx';
import AdmHomePage from './pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from './pages/adm/cadAmbiente.jsx';
import SolicitacoesCadastroPage from './pages/adm/solicitacoesCadastroPage.jsx';
import PublicAmbienteDetalhesPage from './pages/public/PublicAmbienteDetalhesPage.jsx';

import ProfessorLayout from './pages/user/professor/professorLayout.jsx';
import ProfessorHomePage from './pages/user/professor/professorHomePage.jsx';
import ReservarAmbientePage from './pages/user/professor/reservarAmbientePage.jsx';
import MinhasReservasPage from './pages/user/professor/minhasReservasPage.jsx';

import AlunoLayout from './pages/user/aluno/alunoLayout.jsx';
import AlunoHomePage from './pages/user/aluno/alunoHomePage.jsx';

import UserProfilePage from './pages/user/userProfilePage.jsx';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />
       <Route path="/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />


      {/* Admin com rotas filhas */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdmHomePage />} />           
        <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
        <Route path="solicitacoes-cadastro" element={<SolicitacoesCadastroPage />} />
        <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
      </Route>

      {/* Aluno */}
      <Route path="/aluno" element={<AlunoLayout />}>
        <Route index element={<AlunoHomePage />} />
        <Route path="reservar-recursos" element={<ReservarAmbientePage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
      </Route>

      {/* Professor */}
      <Route path="/professor" element={<ProfessorLayout />}>
        <Route index element={<ProfessorHomePage />} />
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="buscar-recursos" element={<ReservarAmbientePage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} /> 
      </Route>
    </Routes>
  );
}

export default App;