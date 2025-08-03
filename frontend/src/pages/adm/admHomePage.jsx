import { Link } from 'react-router-dom'; // Importante para criar links de navegação
import styles from './css/admHomePage.module.css';
import AmbientesList from '../../components/shared/AmbientesList.jsx';

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

            </div>
                <hr className={styles.divider} />

                <div className={styles.listSection}>
                    <h2>Visão Geral dos Ambientes</h2>
                    <Link to="/admin/cadastrar-ambiente" className={styles.actionButtonCadastro}>+ Cadastrar Novo Ambiente</Link>
                </div>
            <AmbientesList />
        </div>
    );
};

export default AdmHomePage;