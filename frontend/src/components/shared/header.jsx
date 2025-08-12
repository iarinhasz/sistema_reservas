import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/header.module.css';
import Button from './Button';

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
                <Button as={Link} to="/perfil" variant="primary">Ver Perfil</Button>
                <Button onClick={handleLogout} variant="cancel">Sair</Button>
            </>
            ) : (
            // Se o usuário está DESLOGADO
            <>
                <Button onClick={() => navigate('/login')} variant="primary">Login</Button>
                <Button onClick={() => navigate('/solicitar-cadastro')} variant="secondary">Solicitar Cadastro</Button>
            </>
            )}
        </div>
        </header>
        );
};

export default Header;