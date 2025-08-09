import { Route, Routes } from 'react-router-dom';

// Layouts
import AppLayout from '../components/layout/AppLayout.jsx';
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
import AmbienteDetalhesPage from '../pages/adm/AmbienteDetalhesPage.jsx';
import CadastrarAmbientePage from '../pages/adm/cadAmbiente.jsx';
import GerenciarUsuariosPage from '../pages/adm/GerenciarUsuariosPage.jsx';
import VisualizarReviewsPage from '../components/adm/VisualizarReviewsPage.jsx';
// Páginas de Usuário
import AlunoHomePage from '../pages/user/aluno/alunoHomePage.jsx';
import ProfessorHomePage from '../pages/user/professor/professorHomePage.jsx';
import ReservarAmbientePage from '../pages/user/professor/reservarAmbientePage.jsx';
import PaginaReview from '../pages/user/PaginaReview.jsx';

// PÁGINAS COMPARTILHADAS (CAMINHOS CORRIGIDOS CONFORME SUA ESTRUTURA)
import MinhasReservasPage from '../components/shared/MinhasReservasPage.jsx';
import UserProfilePage from '../pages/user/userProfilePage.jsx';


const AppRouter = () => {
  return (
    <Routes>
      {/* Rotas Públicas com Layout Padrão */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
        <Route path="/review/ambiente/:id" element={<PaginaReview />} />
    </Route>
      {/* Rotas de Autenticação */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />
      
      {/* Rotas de Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdmHomePage />} />
        <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
        <Route path="solicitacoes-cadastro" element={<GerenciarUsuariosPage />} />
        <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="reviews" element={<VisualizarReviewsPage />} />

      </Route>

      {/* Rota de Aluno */}
      <Route path="/aluno" element={<AlunoLayout />}>
        <Route index element={<AlunoHomePage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
      </Route>

      {/* Rota de Professor */}
      <Route path="/professor" element={<ProfessorLayout />}>
        <Route index element={<ProfessorHomePage />} />
        <Route path="/professor/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
        <Route path="minhas-reservas" element={<MinhasReservasPage />} />
        <Route path="perfil" element={<UserProfilePage />} />
        <Route path="/professor/reservar-ambiente" element={<ReservarAmbientePage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;