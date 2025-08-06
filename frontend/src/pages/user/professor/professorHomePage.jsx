import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Ajuste o caminho conforme seu projeto
import styles from '../../adm/css/admHomePage.module.css';

const ProfessorHomePage = () => {
    const { user } = useAuth();

    return (
        <div className={styles.adminPage}>
            <h1>Minha Página Inicial</h1>
            <p>Bem-vindo{user?.nome ? `, ${user.nome}` : ''}! Aqui você pode gerenciar suas reservas de ambientes e equipamentos.</p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Link to="/professor/minhas-reservas" className={styles.actionButton}>
                    Ver Minhas Reservas
                </Link>
                <Link to="/professor/buscar-recursos" className={styles.actionButton}>
                    + Fazer Nova Reserva
                </Link>
            </div>
        </div>
    );
};

export default ProfessorHomePage;
