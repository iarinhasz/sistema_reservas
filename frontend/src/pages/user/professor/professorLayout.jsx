// src/pages/user/professor/professorLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import styles from '../../adm/css/admLayout.module.css';
import { LogoutIcon } from '../../../components/icons/index';

const ProfessorLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.tipo !== 'professor')) {
      logout();
      navigate('/login');
    }
  }, [user, loading, navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  if (loading || !user) {
    return <div>Verificando acesso...</div>;
  }

  return (
    <div className={styles.layoutContainer}>
      <aside className={`${styles.sidePanel} ${menuOpen ? styles.open : ''}`}>
        <div className={styles.panelHeader}>
          <h3>Painel do Professor</h3>
          <p>Bem-vindo, {user.nome}</p>
        </div>
        <nav className={styles.nav}>
          <Link to="/professor" className={styles.navLink} onClick={closeMenu}>Página Inicial</Link>
          <Link to="/professor/buscar-recursos" className={styles.navLink} onClick={closeMenu}>Reservar Recursos</Link>
          <Link to="/professor/minhas-reservas" className={styles.navLink} onClick={closeMenu}>Minhas Reservas</Link>
        </nav>
        <div className={styles.panelFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {menuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button 
            className={styles.hamburgerButton} 
            onClick={() => setMenuOpen(prev => !prev)} 
            aria-label="Abrir menu lateral"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={styles.headerTitle}>Sistema de Reservas</div>
          <Link to="/professor/perfil" className={styles.profileButton}>Ver Perfil</Link>
        </header>

        <main className={styles.content}>
          <Outlet /> {/* Páginas-filhas serão renderizadas aqui */}
        </main>
      </div>
    </div>
  );
};

export default ProfessorLayout;
