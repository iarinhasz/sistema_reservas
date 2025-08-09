import { Link } from 'react-router-dom'; // Importante para criar links de navegação
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './css/admHomePage.module.css';
import { useAuth } from '../../context/AuthContext';
import AmbientesList from '../../components/shared/AmbientesList.jsx';

const AdmHomePage = () => {
    const { user } = useAuth();
    const [hasPendingRequests, setHasPendingRequests] = useState(false);

    useEffect(() => {        
        const checkForPendingRequests = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/api/usuarios/pendentes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.usuarios && response.data.usuarios.length > 0) {
                    setHasPendingRequests(true);
                }
            } catch (error) {
                console.error("Erro ao verificar solicitações pendentes:", error);
            }
        };

        checkForPendingRequests();
    }, []);
    
    return (
        <div className={styles.adminPage}>
            <h1>Pagina Inicial do Administrador</h1>
            <p></p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Link 
                    to="/admin/solicitacoes-cadastro" 
                    className={hasPendingRequests ? styles.actionButtonAlert : styles.actionButton}
                >
                    Gerencia de Usuários
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
            <AmbientesList userRole={user?.tipo} />
        </div>
    );
};

export default AdmHomePage;