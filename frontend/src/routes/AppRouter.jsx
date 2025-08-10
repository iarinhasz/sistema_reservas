import { Route, Routes } from 'react-router-dom';

//Layouts
import AppLayout from '../components/layout/AppLayout.jsx'; 
import UserLayout from '../components/layout/UserLayout.jsx'; 
import ProtectedRoute from './ProtectedRoute.jsx';

// Páginas Públicas
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/Login.jsx';
import PublicAmbienteDetalhesPage from '../pages/public/PublicAmbienteDetalhesPage.jsx';
import RequestAccessPage from '../pages/public/RequestAccessPage';

// Páginas de Admin
import VisualizarReviewsPage from '../components/adm/VisualizarReviewsPage.jsx';
import AdmHomePage from '../pages/adm/admHomePage.jsx';
import AmbienteDetalhesPage from '../pages/adm/AmbienteDetalhesPage.jsx';
import CadastrarAmbientePage from '../pages/adm/cadAmbiente.jsx';
import GerenciarUsuariosPage from '../pages/adm/GerenciarUsuariosPage.jsx';

// Páginas de Usuário
import AlunoHomePage from '../pages/user/aluno/alunoHomePage.jsx';
import PaginaReview from '../pages/user/PaginaReview.jsx';
import ProfessorHomePage from '../pages/user/professor/professorHomePage.jsx';
import ReservarAmbientePage from '../pages/user/professor/reservarAmbientePage.jsx';
import MinhasReservasPage from '../components/shared/MinhasReservasPage.jsx';
import UserProfilePage from '../pages/user/userProfilePage.jsx';

const adminLinks = [
    { to: "/admin", label: "Página Inicial" },
    { to: "/admin/cadastrar-ambiente", label: "Cadastrar Ambiente" },
    { to: "/admin/solicitacoes-cadastro", label: "Gerenciar Usuários" }
  ];
const professorLinks = [
    { to: "/professor", label: "Página Inicial" },
    { to: "/professor/buscar-recursos", label: "Reservar Ambiente" },
    { to: "/professor/minhas-reservas", label: "Minhas Reservas" }
];
const alunoLinks = [
    { to: "/aluno", label: "Página Inicial" },
    { to: "/aluno/minhas-reservas", label: "Minhas Reservas" }
];

const AppRouter = () => {
  return (
    <Routes>
        {/* Rotas Públicas (sem login) */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/solicitar-cadastro" element={<RequestAccessPage />} />
        

        {/* Rotas de Admin */}
        <Route 
          path="/admin" 
          element={<ProtectedRoute allowedRoles={['admin']}><UserLayout panelTitle="Painel do Admin" navLinks={adminLinks} /></ProtectedRoute>}
        >
          <Route index element={<AdmHomePage />} />
          <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
          <Route path="solicitacoes-cadastro" element={<GerenciarUsuariosPage />} />
          <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
          <Route path="perfil" element={<UserProfilePage />} />
          <Route path="reviews" element={<VisualizarReviewsPage />} />
        </Route>

        {/* Rotas de Aluno */}
        <Route 
          path="/aluno" 
          element={<ProtectedRoute allowedRoles={['aluno']}><UserLayout panelTitle="Painel do Aluno" navLinks={alunoLinks} /></ProtectedRoute>}
        >
          <Route index element={<AlunoHomePage />} />
          <Route path="minhas-reservas" element={<MinhasReservasPage />} />
          <Route path="perfil" element={<UserProfilePage />} />
          <Route path="ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
        </Route>

        {/* Rotas de Professor */}
        <Route 
          path="/professor" 
          element={<ProtectedRoute allowedRoles={['professor']}><UserLayout panelTitle="Painel do Professor" navLinks={professorLinks} /></ProtectedRoute>}
        >
          <Route index element={<ProfessorHomePage />} />
          <Route path="minhas-reservas" element={<MinhasReservasPage />} />
          <Route path="perfil" element={<UserProfilePage />} />
          <Route path="ambientes/:id" element={<PublicAmbienteDetalhesPage />} />
          <Route path="buscar-recursos" element={<ReservarAmbientePage />} />
        </Route>
      </Routes>
  );
};

export default AppRouter;