import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './PublicAmbienteDetalhesPage.module.css';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente'; // Importe o novo componente
import { useAuth} from '../../context/AuthContext';
import ReservarModal from '../../components/shared/ReservarModal';

const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshAgendaKey, setRefreshAgendaKey] = useState(0);


    useEffect(() => {
        const fetchAmbiente = async () => {
            setLoading(true);
            try {
                // Agora busca apenas os dados do ambiente
                const response = await api.get(`/ambientes/${id}`);
                setAmbiente(response.data);
            } catch (err) {
                setError('Falha ao carregar dados do ambiente.');
            } finally {
                setLoading(false);
            }
        };
        fetchAmbiente();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const fetchEquipamentos = async () => {
            try {
                // 1. Buscamos TODOS os equipamentos
                const response = await api.get(`/equipamentos`);
                
                // 2. Filtramos a lista para pegar apenas os que pertencem a este ambiente
                //    (usando '==' para comparar string com número sem problemas de tipo)
                const equipamentosDoAmbiente = response.data.filter(
                    (equipamento) => equipamento.ambiente_id == id
                );
                
                // 3. Atualizamos o estado com a lista já filtrada
                setEquipamentos(equipamentosDoAmbiente || []);

            } catch (error) {
                console.error("Erro ao buscar equipamentos:", error);
            }
        };

        fetchEquipamentos();
    }, [id]); 
    const handleOpenReserveModal = () => {
        if (!user) {
            navigate('/login'); // Se por algum motivo o usuário se deslogou, peça login
        } else {
            setIsModalOpen(true);
        }
    };

    const handleReservationSuccess = () => {
        alert('Sua solicitação de reserva foi enviada com sucesso!');
        setIsModalOpen(false);
        setRefreshAgendaKey(prevKey => prevKey + 1);
    };

    const renderActionButtons = () => {
        if (!user) {
            return null;
        }

        return (
            <div className={styles.actions}>
                <Link
                    to={`/${user.tipo}/minhas-reservas?recursoId=${id}&recursoTipo=ambiente`}
                    className={styles.actionButton}
                >
                    Minhas Reservas
                </Link>

                {/* Botão de Fazer Reserva muda conforme o tipo de usuário */}
                {(user.tipo === 'professor') && (
                    <button onClick={handleOpenReserveModal} className={styles.actionButton}>
                        + Fazer Nova Reserva
                    </button>
                )}

                {user.tipo === 'aluno' && (
                    <Link to={`/aluno/reservar-equipamento/${id}`} className={styles.actionButton}>
                        Reservar Equipamento
                    </Link>
                )}
                
                <Link to={`/review/ambiente/${id}`} className={styles.actionButton}>
                    Fazer Review
                </Link>
            </div>
        );
    };

    if (loading) return <p className={styles.message}>Carregando...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!ambiente) return <p className={styles.message}>Ambiente não encontrado.</p>;

    return (
        <>
            {/* 4. Renderização condicional do Modal */}
            {isModalOpen && (
                <ReservarModal
                    recurso={{...ambiente, recurso_tipo: 'ambiente'}}
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleReservationSuccess}
                />
            )}

            <div className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <h1>{ambiente.identificacao}</h1>
                        <p className={styles.subtitulo}>Veja a agenda de horários e solicite sua reserva.</p>
                    </div>
                    <Link to="/" className={styles.backButton}>Voltar para Início</Link>
                </header>
                
                {renderActionButtons()}

                <div className={styles.ambienteDetails}>
                    <h2>Detalhes do Ambiente</h2>
                    <p><strong>Tipo:</strong> {ambiente.tipo}</p>
                    <p><strong>Capacidade:</strong> {ambiente.capacidade} pessoas</p>
                    <p><strong>Descrição:</strong> {ambiente.descricao}</p>
                </div>
                <h2>Equipamentos neste Ambiente</h2>
                    {equipamentos.length > 0 ? (
                        <ul className={styles.equipamentosList}>
                            {equipamentos.map((equipamento) => (
                                <li key={equipamento.id}>
                                    {equipamento.nome}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Nenhum equipamento cadastrado para este ambiente.</p>
                    )}                    
                <h2>Agenda de Reservas</h2>
                <AgendaAmbiente ambienteId={id} refreshKey={refreshAgendaKey} />
            </div>
        </>
    );
};

export default PublicAmbienteDetalhesPage;