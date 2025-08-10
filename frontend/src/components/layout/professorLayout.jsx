// src/pages/user/professor/professorLayout.jsx
import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LogoutIcon, MenuIcon } from '../icons/index';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './userPages.module.css';

const ProfessorLayout = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.tipo !== 'professor')) {
      logout();
    }
  }, [user, loading, logout]);

  const handleLogout = () => {
    logout();
  };


  if (loading || !user) {
    return <div>Verificando acesso...</div>;
  }

  return (
    <div className={styles.layoutContainer}>
      {/* O painel lateral agora usa 'isPanelOpen' */}
      <aside className={`${styles.sidePanel} ${isPanelOpen ? styles.open : ''}`}>
        <div className={styles.panelHeader}>
          <h3>Painel do Professor</h3>
          <p>Bem-vindo, {user.nome}</p>
        </div>
        <nav className={styles.nav}>
          {/* Os links agora chamam 'closeMenu' que usa 'setIsPanelOpen' */}
          <Link to="/professor" onClick={() => setIsPanelOpen(false)}>Página Inicial</Link>
          <Link to="/professor/reservar-ambiente"  onClick={() => setIsPanelOpen(false)}>Reservar Ambiente</Link>
          <Link to="/professor/minhas-reservas"  onClick={() => setIsPanelOpen(false)}>Minhas Reservas</Link>
        </nav>
        <div className={styles.panelFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogoutIcon /> Sair
          </button>
        </div>
      </aside>

      {/* O overlay agora usa 'isPanelOpen' */}
      {isPanelOpen && <div className={styles.overlay} onClick={() => setIsPanelOpen(false)}></div>}

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button 
            className={styles.hamburgerButton} 
            onClick={() => setIsPanelOpen(!isPanelOpen)} 
            aria-label="Abrir menu"
            aria-expanded={isPanelOpen}

          >
            <MenuIcon />
          </button>
          <div className={styles.headerTitle}>Sistema de Reservas</div>
          <Link to="/professor/perfil" className={styles.profileButton}>Ver Perfil</Link>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProfessorLayout;
