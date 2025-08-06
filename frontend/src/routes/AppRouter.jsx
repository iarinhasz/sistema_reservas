import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfessorLayout from "../components/layouts/ProfessorLayout";
import ProfessorHomePage from "../pages/professor/HomePage";
// ... outras importações

const AppRouter = () => {
  return (
    <Routes>
      {/* === ROTAS PÚBLICAS === */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* === ROTAS LOGADOS === */}
      <Route path="/professor" element={<ProfessorLayout />}>
        <Route path="home" element={<ProfessorHomePage />} />
        {/* outras rotas aninhadas */}
      </Route>
    </Routes>
  );
};

export default AppRouter;
