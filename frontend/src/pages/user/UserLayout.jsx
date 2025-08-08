import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './css/UserLayout.module.css';
import { MenuIcon, ProfileIcon, LogoutIcon } from '../../components/icons';

const UserLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layoutContainer}>
            <aside className={`${styles.sidePanel} ${isPanelOpen ? styles.open : ''}`}>
                <div className={styles.panelHeader}>
                    <h3>Menu</h3>
                    <p>Bem-vindo, {user?.nome}</p>
                </div>
                <nav className={styles.nav}>
                    <Link to={`/${user?.tipo}`}>Página Inicial</Link>
                    <Link to={`/${user?.tipo}/minhas-reservas`}>Minhas Reservas</Link>
                </nav>
                <div className={styles.panelFooter}>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogoutIcon /> Sair
                    </button>
                </div>
            </aside>

            {isPanelOpen && <div className={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <button className={styles.hamburgerButton} onClick={() => setIsPanelOpen(true)}>
                        <MenuIcon />
                    </button>
                    <div className={styles.headerTitle}>Sistema de Reservas</div>
                    <Link to={`/${user?.tipo}/perfil`} className={styles.profileButton}>
                        <ProfileIcon /> Ver Perfil
                    </Link>
                </header>
                
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;