import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../css/header.module.css'; 
import styles from '../css/header.module.css';

const Header = () => {
    const { user, logout } = useAuth(); // Pegando o usuário e a função de logout do seu hook
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redireciona para a página de login após o logout
    };

    return (
    // A tag <header> é a barra em si
        <header className={styles.headerBar}>
            <div className={styles.headerTitle}>
                Sistema de Reservas
            </div>

            <div className={styles.headerActions}>
            {user ? (
            // Se o usuário está LOGADO
            <>
                <Link to="/perfil" className={styles.headerLink}>Ver Perfil</Link>
                <button onClick={handleLogout} className={`${styles.headerButton} ${styles.logoutBtn}`}>
                Sair
                </button>
            </>
            ) : (
            // Se o usuário está DESLOGADO
            <>
                <button onClick={() => navigate('/login')} className={`${styles.headerButton} ${styles.loginBtn}`}>
                    Login
                </button>
                <button onClick={() => navigate('/solicitar-cadastro')} className={`${styles.headerButton} ${styles.registerBtn}`}>
                    Solicitar Cadastro
                </button>
            </>
            )}
        </div>
        </header>
        );
};

export default Header;