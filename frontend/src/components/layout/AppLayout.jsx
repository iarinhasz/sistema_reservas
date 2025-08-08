import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../css/AppLayout.module.css';
import { MenuIcon, ProfileIcon, LogoutIcon } from '../icons/index'; // Ajuste o caminho se necessário

const AppLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layoutContainer}>
            <header className={styles.header}>
                <button className={styles.hamburgerButton}>
                    <MenuIcon />
                </button>
                <div className={styles.headerTitle}>Sistema de Reservas</div>
                {user ? (
                    <Link to={`/${user.tipo}/perfil`} className={styles.profileButton}>
                        <ProfileIcon /> Ver Perfil
                    </Link>
                ) : (
                    <Link to="/login" className={styles.loginButton}>Entrar</Link>
                )}
            </header>
            
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;