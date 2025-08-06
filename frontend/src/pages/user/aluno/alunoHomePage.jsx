import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Ajuste o caminho conforme seu projeto
import styles from '../../adm/css/admHomePage.module.css';

const AlunoHomePage = () => {
    const { user } = useAuth();

    return (
        <div className={styles.adminPage}>
            <h1>Minha Página Inicial</h1>
            <p>Bem-vindo{user && user.nome ? `, ${user.nome}` : ''}! Aqui você pode gerenciar suas reservas de equipamentos.</p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Link to="/aluno/minhas-reservas" className={styles.actionButton}>
                    Ver Minhas Reservas
                </Link>
                <Link to="/aluno/buscar-equipamentos" className={styles.actionButton}>
                    + Fazer Nova Reserva
                </Link>
            </div>
        </div>
    );
};

export default AlunoHomePage;
