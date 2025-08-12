// src/routes/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    // Se não há usuário ou se o tipo não é 'admin', nega o acesso
    if (!user || user.tipo !== 'admin') {
        // Redireciona para a página inicial ou uma página de "acesso negado"
        return <Navigate to="/" replace />; 
    }

    return children;
};

export default AdminRoute;