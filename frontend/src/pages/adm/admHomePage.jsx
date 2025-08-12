import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './css/admHomePage.module.css';
import { useAuth } from '../../context/AuthContext';
import { useNotificacao } from '../../hooks/useNotificacao.js';
import AmbientesList from '../../components/shared/AmbientesList.jsx';
import Button from '../../components/shared/Button.jsx';

const AdmHomePage = () => {
    const { user } = useAuth();
    const { temNovoCadastro } = useNotificacao();

    const [solicitacoesIniciais, setSolicitacoesIniciais] = useState(false);
    useEffect(() => {        
        const checkForPendingRequests = async () => {
            try {
                const response = await api.get('/usuarios/pendentes');
                if (response.data.usuarios && response.data.usuarios.length > 0) {
                    setSolicitacoesIniciais(true);
                }
            } catch (error) {
                console.error("Erro ao verificar solicitações pendentes:", error);
            }
        };
        checkForPendingRequests();
    }, []);

    const temAlerta = solicitacoesIniciais || temNovoCadastro;
    
    return (
        <div className={styles.adminPage}>
            <h1>Página Inicial do Administrador</h1>
            <p></p>
            
            <hr />

            <div className={styles.actionPanel}>
                <Button 
                    as={Link}
                    to="/admin/solicitacoes-cadastro" 
                    variant={temAlerta ? 'dangerOutline' : 'primary'}
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
