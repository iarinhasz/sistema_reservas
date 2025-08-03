import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './css/admLayout.module.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    // Estado para controlar se o painel de navegação está aberto ou fechado
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles.layoutContainer}>

            <aside className={`${styles.sidePanel} ${isPanelOpen ? styles.open : ''}`}>
                <div className={styles.panelHeader}>
                    <h3>Painel ADM</h3>
                    <p>Bem-vindo, {user?.nome || 'Admin'}</p>
                </div>
                <nav className={styles.nav}>
                    <Link to="/admin" onClick={() => setIsPanelOpen(false)}>Pagina Inicial</Link>
                    <Link to="/admin/cadastrar-ambiente" onClick={() => setIsPanelOpen(false)}>Cadastrar Ambiente</Link>
                    <Link to="/admin/solicitacoes-cadastro" onClick={() => setIsPanelOpen(false)}>Solicitações de Cadastro</Link>
                    <Link to="/admin/solicitacoes-reserva" onClick={() => setIsPanelOpen(false)}>Solicitações de Reserva</Link>
                </nav>
                <div className={styles.panelFooter}>
                    <button onClick={handleLogout} className={styles.logoutButton}>Sair (Logout)</button>
                </div>
            </aside>

            {isPanelOpen && <div className={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <button className={styles.hamburgerButton} onClick={() => setIsPanelOpen(!isPanelOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <div className={styles.headerTitle}>
                        Sistema de Reservas - Admin
                    </div>
                    <Link to="/admin/perfil" className={styles.profileButton}>Ver Perfil</Link>
                </header>
                
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;