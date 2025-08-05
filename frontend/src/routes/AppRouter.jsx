// frontend/src/routes/AppRouter.jsx

import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Importando componentes de Rota e Layout
import AdminLayout from '../pages/adm/admLayout.jsx';
import ProtectedRoute from './ProtectedRoute';

// Importando todas as páginas necessárias
import AdminDashboardPage from '../pages/adm/admHomePage.jsx';
import AmbienteDetalhesPage from '../pages/adm/AmbienteDetalhesPage.jsx';
import CadastrarAmbientePage from '../pages/adm/cadAmbiente.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import LoginPage from '../pages/public/LoginPage.jsx';
// Importe outras páginas que você vai usar...

const AdminRoutes = () => (
    <AdminLayout>
        <Routes>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />
        </Routes>
    </AdminLayout>
);

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* === ROTAS PÚBLICAS === */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                {/* === ROTAS LOGADOS NÃO ADMIN ===*/}
                {/* Rota para Usuários Logados (não-admins) */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <UserDashboardPage />
                        </ProtectedRoute>
                    } 
                />
                {/* === ROTAS DE ADMIN === */}
                {/* Esta é a rota "pai". Ela protege e aplica o layout a todas as rotas filhas. */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <AdminRoutes /> {/* <-- Apenas uma linha, fácil de ler */}
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                >
                    {/* Rotas "filhas". Elas serão renderizadas dentro do <Outlet /> do AdminLayout */}
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="cadastrar-ambiente" element={<CadastrarAmbientePage />} />
                    
                    {/* ESTA É A ROTA QUE ESTAVA FALTANDO/INCORRETA */}
                    {/* Note que o path NÃO começa com "/" */}
                    <Route path="ambientes/:id" element={<AmbienteDetalhesPage />} />

                    {/* Adicione outras rotas de admin aqui no futuro */}
                    {/* Ex: <Route path="solicitacoes-cadastro" element={<SolicitacoesCadastroPage />} /> */}
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;