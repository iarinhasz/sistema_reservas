import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './UserLayout.module.css'; 
import { MenuIcon, ProfileIcon, LogoutIcon } from '../icons/index';
import { useState } from 'react';
import Button from '../shared/Button';

const UserLayout = ({ panelTitle, navLinks = [] }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const naPaginaDePerfil = location.pathname.endsWith('/perfil');

    return (
        <div className={styles.layoutContainer}>
            <aside className={`${styles.sidePanel} ${isPanelOpen ? styles.open : ''}`}>
                <div className={styles.panelHeader}>
                    <h3>{panelTitle}</h3>
                    <p>Bem-vindo, {user?.nome}</p>
                </div>
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} onClick={() => setIsPanelOpen(false)}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
                <div className={styles.panelFooter}>
                    <Button onClick={handleLogout} variant="danger" icon={LogoutIcon}>
                        Sair
                    </Button>
                </div>
            </aside>

            {isPanelOpen && <div className={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}

            <div className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerStart}>
                        <button className={styles.hamburgerButton} onClick={() => setIsPanelOpen(true)}>
                            <MenuIcon />
                        </button>
                    </div>

                    <div className={styles.headerTitle}>
                        Sistema de Reservas
                    </div>
                    
                    <div className={styles.headerEnd}>
                        {!naPaginaDePerfil && (
                            <NavLink to={`/${user?.tipo}/perfil`} className={styles.profileButton}>
                                <ProfileIcon /> Ver Perfil
                            </NavLink>
                        )}
                    </div>
                </header>
                
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserLayout;