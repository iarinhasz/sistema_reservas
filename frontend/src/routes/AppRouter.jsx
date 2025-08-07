import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfessorLayout from "../components/layouts/ProfessorLayout";
import ProfessorHomePage from "../pages/professor/HomePage";
import PublicAmbienteDetalhes from "../pages/public/PublicAmbienteDetalhesPage";
// ... outras importações

const AppRouter = () => {
  return (
    <Routes>
      {/* === ROTAS PÚBLICAS === */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* === ROTAS LOGADOS === */}
      <Route path="/professor" element={<ProtectedRoute> <ProfessorLayout /> </ProtectedRoute>} >
          <Route index element={<ProfessorHomePage />} /> </Route>
          <Route path="ambiente/:id" element = {<PublicAmbienteDetalhes />}></Route>
    </Routes>
  );
};

export default AppRouter;
