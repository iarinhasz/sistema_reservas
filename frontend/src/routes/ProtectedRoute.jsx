import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAuthorized = allowedRoles && allowedRoles.includes(user.tipo);

    if (allowedRoles && !isAuthorized) {
        return <Navigate to={`/${user.tipo}`} replace />;
    }

    return children;
};

export default ProtectedRoute;