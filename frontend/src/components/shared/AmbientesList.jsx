import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotificacao } from '../../hooks/useNotificacao.js';
import { useNavigate } from 'react-router-dom';
import styles from './AmbientesList.module.css';
import Button from './Button.jsx';
import { DeleteIcon, EditIcon } from '../icons/index';

const AmbientesList = ({ userRole }) => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { alertasReserva = new Set() } = useNotificacao() || {};
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAmbienteClick = (ambienteId) => {

        if (userRole === 'admin') {
            navigate(`/admin/ambientes/${ambienteId}`);
        } 
 
        else if (userRole === 'professor' || userRole === 'aluno') {
            navigate(`/${userRole}/ambientes/${ambienteId}`);
        } 

        else {
            navigate(`/ambientes/${ambienteId}`);
        }
    };

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const response = await api.get('/ambientes');
                setAmbientes(response.data);
            } catch (err) {
                setError('Não foi possível carregar os ambientes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbientes();
    }, []);

    const ambientesAgrupados = ambientes.reduce((acc, ambiente) => {
        const tipo = ambiente.tipo || 'Outros';
        if (!acc[tipo]) {
            acc[tipo] = [];
        }
        acc[tipo].push(ambiente);
        return acc;
    }, {});

    const handleDelete = async (ambienteId, ambienteNome) => {
        if (window.confirm(`Tem certeza que deseja deletar o ambiente "${ambienteNome}"?`)) {
            try {
                await api.delete(`/ambientes/${ambienteId}`);
                setAmbientes(listaAtual => listaAtual.filter(amb => amb.id !== ambienteId));
            } catch (err) {
                alert(err.response?.data?.message || 'Erro ao deletar o ambiente.');
            }
        }
    };
    
    if (loading) return <p className={styles.message}>Carregando ambientes...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <main className={styles.ambientesGrid}>
            {Object.entries(ambientesAgrupados).map(([tipo, listaDeAmbientes]) => (
                <section key={tipo} className={styles.ambienteColuna}>
                    <h2>{tipo}</h2>
                    <div className={styles.botoesContainer}>
                        {listaDeAmbientes.map(ambiente => {
                            const temAlertaPendente = userRole === 'admin' && ambiente.pending_reservations_count > 0;
                            const temAlertaTempoReal = userRole === 'admin' && alertasReserva.has(ambiente.id);
                            const temAlerta = temAlertaPendente || temAlertaTempoReal;

                            return (
                                <div key={ambiente.id} className={styles.ambienteBotaoContainer}>
                                    <Button
                                        onClick={() => handleAmbienteClick(ambiente.id)}
                                        variant={temAlerta ? 'alertaAmbiente' : 'primary'}
                                        className={styles.ambienteBotao}
                                        title={temAlerta ? `Solicitações pendentes` : `Ver detalhes de ${ambiente.identificacao}`}
                                    >
                                        {ambiente.identificacao}
                                    </Button>

                                    {userRole === 'admin' && (
                                        <div className={styles.iconActions}>
                                            <button 
                                                onClick={() => navigate(`/admin/ambientes/${ambiente.id}`)}
                                                className={styles.iconButton} 
                                                title="Editar Ambiente"
                                            >
                                                <EditIcon />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ambiente.id, ambiente.identificacao)}
                                                className={`${styles.iconButton} ${styles.deleteButton}`}
                                                title="Deletar Ambiente"
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </div>                                    
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}
        </main>
    );
};

export default AmbientesList;
