import { Link } from 'react-router-dom'; // Importante para criar links de navegação
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './css/admHomePage.module.css';
import { useAuth } from '../../context/AuthContext';
import AmbientesList from '../../components/shared/AmbientesList.jsx';
import Button from '../../components/shared/Button.jsx';

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
            <h1>Página Inicial do Administrador</h1>
            <p></p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Button 
                    as={Link}
                    to="/admin/solicitacoes-cadastro" 
                    variant={hasPendingRequests ? 'dangerOutline' : 'primary'}
                >
                    Gerencia de Usuários
                </Button>

                <Button as={Link} to="/admin/reviews" variant="primary">
                    Visualizar Reviews
                </Button>

            </div>

                <div className={styles.listSectionHeader}>
                    <h2>Visão Geral dos Ambientes</h2>
                        <Button as={Link} to="/admin/cadastrar-ambiente" variant="secondary">
                            + Cadastrar Novo Ambiente
                        </Button>
                </div>
            <AmbientesList userRole={user?.tipo} />
        </div>
    );
};

export default AdmHomePage;