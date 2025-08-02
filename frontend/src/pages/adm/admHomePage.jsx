import { Link } from 'react-router-dom'; // Importante para criar links de navegação
import styles from './css/admHomePage.module.css';

const AdmHomePage = () => {
    return (
        <div className={styles.adminPage}>
            <h1>Pagina Inicial do Administrador</h1>
            <p></p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Link to="/admin/solicitacoes-cadastro" className={styles.actionButton}>
                    Solicitações de Cadastro Pendentes
                </Link>

                <Link to="/admin/solicitacoes-reserva" className={styles.actionButton}>
                    Solicitações de Reservas Pendentes
                </Link>

                <Link to="/admin/reviews" className={styles.actionButton}>
                    Visualizar Reviews
                </Link>

                <Link to="/admin/cadastrar-ambiente" className={styles.actionButtonCadastro}>
                    + Cadastrar Novo Ambiente
                </Link>
                <Link to="Ver Perfil" className={styles.actionButton}>
                    Ver Perfil
                </Link>
            </div>
        </div>
    );
};

export default AdmHomePage;