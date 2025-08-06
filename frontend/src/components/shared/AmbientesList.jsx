import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../css/AmbientesList.module.css'; //

const AmbientesList = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useAuth(); // Pega o usuário logado do contexto
    const navigate = useNavigate(); // Hook para redirecionar

    //permissoes de acesso aos usuarios que clicam no ambiente
    const handleAmbienteClick = (ambienteId) => {
        if (!user) {
            // Cenário 3: Visitante não logado
            navigate('/login');
        } else if (user.tipo === 'admin') {
            // Cenário 1: Administrador
            navigate(`/admin/ambientes/${ambienteId}`);
        } else {
            // Cenário 2: Professor ou Aluno
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
                        {listaDeAmbientes.map(ambiente => (
                            <div key={ambiente.id} className={styles.ambienteBotaoContainer}>
                                <button
                                    onClick={() => handleAmbienteClick(ambiente.id)}
                                    className={`${styles.ambienteBotao} ${ambiente.pending_reservations_count > 0 ? styles.ambienteBotaoAlert : ''}`}
                                >
                                    {ambiente.identificacao}
                                </button>
                                {/* Renderização condicional do ícone de edição */}
                                {user?.tipo === 'admin' && (
                                    <div className={styles.iconActions}>
                                        <Link to={`/admin/ambientes/${ambiente.id}`} className={styles.iconButton} title="Editar Ambiente">
                                            ✏️
                                        </Link>
                                        {/* BOTÃO DE DELETAR COM O ÍCONE 'X' */}
                                        <button 
                                            onClick={() => handleDelete(ambiente.id, ambiente.identificacao)}
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            title="Deletar Ambiente"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
};

export default AmbientesList;