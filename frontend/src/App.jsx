import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import AdmHomePage from './pages/adm/admHomePage.jsx';
import CadastrarAmbientePage from './pages/adm/cadAmbiente.jsx';
import HomePage from './pages/public/HomePage';

function App() {
    return (
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                {/*<Route path="/solicitar-cadastro" element={<SolicitarCadastro />} />*/}
                {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                {/* Adicione outras rotas aqui */}
                <Route path="/admin" element={<AdmHomePage />} />
                <Route path="/admin/cadastrar-ambiente" element={<CadastrarAmbientePage />} />
            </Routes>
    );
}

export default App;