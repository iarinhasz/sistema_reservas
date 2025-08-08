import { Routes, Route } from 'react-router-dom';

// Layouts
import AdminLayout from '../pages/adm/admLayout.jsx';
import AlunoLayout from '../pages/user/aluno/alunoLayout.jsx';
import ProfessorLayout from '../pages/user/professor/professorLayout.jsx';

// Páginas Públicas
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/Login.jsx';
import PublicAmbienteDetalhesPage from '../pages/public/PublicAmbienteDetalhesPage.jsx';
import RequestAccessPage from '../pages/public/RequestAccessPage';

// Páginas de Admin
import AdmHomePage from '../pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from '../pages/adm/cadAmbiente.jsx';
import SolicitacoesCadastroPage from '../pages/adm/solicitacoesCadastroPage.jsx';
import AmbienteDetalhesPage from '../pages/adm/AmbienteDetalhesPage.jsx';

// Páginas de Usuário (Professor e Aluno)
import AlunoHomePage from '../pages/user/aluno/alunoHomePage.jsx';
import ProfessorHomePage from '../pages/user/professor/professorHomePage.jsx';
import UserProfilePage from '../pages/user/userProfilePage.jsx';
import ReservarAmbientePage from '../pages/user/professor/reservarAmbientePage.jsx';

// Componentes Compartilhados usados como páginas
import MinhasReservasPage from '../components/shared/MinhasReservasPage.jsx';

const AppRouter = () => {
  return (
    <Routes>
      {/* Rotas Públicas (sem layout de usuário logado) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />
      {/* A home pública e detalhes do ambiente também ficam aqui */}
      <Route path="/" element={<HomePage />} />
      <Route path="/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />

      {/* Rota de Admin com seu próprio Layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdmHomePage />} />
        <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
        <Route path="solicitacoes-cadastro" element={<SolicitacoesCadastroPage />} />
        <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
      </Route>

      {/* Rota de Aluno com seu próprio Layout */}
      <Route path="/aluno" element={<AlunoLayout />}>
        <Route index element={<AlunoHomePage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
        {/* A rota abaixo direciona o aluno para a página de detalhes com o layout de aluno */}
        <Route path="ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
      </Route>

      {/* Rota de Professor com seu próprio Layout */}
      <Route path="/professor" element={<ProfessorLayout />}>
        <Route index element={<ProfessorHomePage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="buscar-recursos" element={<ReservarAmbientePage />} />
        {/* A rota abaixo direciona o professor para a página de detalhes com o layout de professor */}
        <Route path="ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;