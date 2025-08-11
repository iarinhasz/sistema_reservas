import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AmbientesList.module.css';
import Button from './Button.jsx';

import {DeleteIcon, EditIcon } from '../icons/index';

const AmbientesList = ({ userRole }) => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    //permissoes de acesso aos usuarios que clicam no ambiente
    const handleAmbienteClick = (ambienteId) => {
        if (userRole === 'admin') {
            navigate(`/admin/ambientes/${ambienteId}`);
        } else {
            // Se for aluno, professor ou visitante, vai para a página pública de detalhes
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

    if (loading) return <p className={styles.message}>Carregando ambientes...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    const handleDelete = async (ambienteId, ambienteNome) => {
        // Pede confirmação ao usuário
        if (window.confirm(`Tem certeza que deseja deletar o ambiente "${ambienteNome}"? Esta ação não pode ser desfeita.`)) {
            try {
                // Faz a chamada DELETE para a API do backend
                await api.delete(`/ambientes/${ambienteId}`);
                
                // Remove o ambiente da lista na tela para feedback instantâneo
                setAmbientes(listaAtual => listaAtual.filter(amb => amb.id !== ambienteId));

            } catch (err) {
                // Exibe a mensagem de erro da API (ex: "Não é possível excluir...")
                alert(err.response?.data?.message || 'Erro ao deletar o ambiente.');
                console.error(err);
            }
        }
    };

    return (
        <main className={styles.ambientesGrid}>
            {Object.entries(ambientesAgrupados).map(([tipo, listaDeAmbientes]) => (
                <section key={tipo} className={styles.ambienteColuna}>
                    <h2>{tipo}</h2>
                    <div className={styles.botoesContainer}>
                        {listaDeAmbientes.map(ambiente => {
                            const temAlerta = userRole === 'admin' && ambiente.pending_reservations_count > 0;
                            return (
                            
                                <div key={ambiente.id} className={styles.ambienteBotaoContainer}>
                                    <Button
                                        onClick={() => handleAmbienteClick(ambiente.id)}
                                        variant={temAlerta ? 'alertaAmbiente' : 'primary'}
                                        
                                        className={styles.ambienteBotao}
                                    >
                                        {ambiente.identificacao}
                                    </Button>



                                    {user?.tipo === 'admin' && (
                                        <div className={styles.iconActions}>
                                            <Link to={`/admin/ambientes/${ambiente.id}`} className={styles.iconButton} title="Editar Ambiente">
                                                <EditIcon />
                                            </Link>
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