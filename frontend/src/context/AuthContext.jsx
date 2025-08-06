import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

// 1. Cria o Contexto
const AuthContext = createContext();

// 2. Cria o Provedor (Provider)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                if (decodedToken.exp * 1000 > Date.now()) {
                    setUser(decodedToken);
                    api.defaults.headers.Authorization = `Bearer ${token}`;
                } else {
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error("Token inválido:", error);
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, []);

    // ✅ MODIFICADO AQUI:
    const login = async (email, senha) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, senha });
            const { token } = response.data;

            if (token) {
                localStorage.setItem('authToken', token);
                api.defaults.headers.Authorization = `Bearer ${token}`;
                
                const userData = jwtDecode(token);
                setUser(userData);

                // Redirecionamento condicional conforme o tipo de usuário
                if (userData.tipo === 'admin') {
                    navigate('/admin');
                } else if (userData.tipo === 'professor') {
                    navigate('/professor');
                } else if (userData.tipo === 'aluno') {
                    navigate('/aluno');
                } else {
                    navigate('/login'); // fallback
                }
            }
        } catch (error) {
            console.error("Falha no login", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

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

// 3. Hook customizado
export const useAuth = () => {
    return useContext(AuthContext);
};