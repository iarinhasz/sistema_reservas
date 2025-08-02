import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import AdmHomePage from './pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from './pages/adm/cadAmbiente.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                {/* <Route path="/solicitar-cadastro" element={<SolicitarCadastro />} /> */}
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                {/* Adicione outras rotas aqui */}
                <Route path="/admin" element={<AdmHomePage />} />
                <Route path="/admin/cadastrar-ambiente" element={<CadastrarAmbientePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;