import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider) - o componente que vai gerenciar o estado
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Guarda os dados do usuário logado
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                // Decodifica o token para pegar os dados do usuário e a data de expiração
                const decodedToken = jwtDecode(token);

                // Verifica se o token não expirou
                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(decodedToken); // Define o usuário no estado
                    api.defaults.headers.Authorization = `Bearer ${token}`; // Reconfigura o axios
                } else {
                    // Se o token expirou, limpa
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error("Token inválido:", error);
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false); // Finaliza o carregamento inicial
    }, []); // O array vazio [] garante que isso só rode uma vez, quando a app carrega


    // Função de Login que será usada por toda a aplicação
    const login = async (email, senha) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, senha });
            const { token } = response.data;

            if (token) {
                // Salva o token no localStorage
                localStorage.setItem('authToken', token);
                // Define o header padrão do axios para futuras requisições
                api.defaults.headers.Authorization = `Bearer ${token}`;
                
                // Decodifica o token para pegar os dados do usuário (opcional, mas útil)

                // Redireciona para a página de admin
                navigate('/admin');
            }
        } catch (error) {
            console.error("Falha no login", error);
            // Re-lança o erro para que a página de login possa exibi-lo
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Função de Logout
    const logout = () => {
        console.log("Executando logout e redirecionando para /login");
        localStorage.removeItem('authToken');
        delete api.defaults.headers.Authorization;
        setUser(null);
        navigate('/login');
    };

    if (loading) {
        return <div>Carregando...</div>;
    }
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Cria um Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};