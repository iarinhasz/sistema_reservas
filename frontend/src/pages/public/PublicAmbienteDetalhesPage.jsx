import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente';
import { useAuth} from '../../context/AuthContext';
import ReservarModal from '../../components/shared/ReservarModal';
import styles from '../../components/layout/UserLayout.module.css'; 
import EquipamentosList from '../../components/shared/EquipamentoList'; 
import Button from '../../components/shared/Button'; 

const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [ambiente, setAmbiente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshAgendaKey, setRefreshAgendaKey] = useState(0);

    const homePath = user ? `/${user.tipo}` : '/';

    useEffect(() => {
        const fetchAmbienteData = async () => {
            setLoading(true);
            try {
                const ambienteRes = await api.get(`/ambientes/${id}`);
                setAmbiente(ambienteRes.data);
            } catch (err) {
                setError('Falha ao carregar dados do ambiente.');
                console.error("Erro detalhado:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbienteData();
    }, [id]);

    const handleOpenReserveModal = () => {
        if (!user) {
            navigate('/login');
        } else {
            setIsModalOpen(true);
        }
    };

    const handleReservationSuccess = () => {
        alert('Sua solicitação de reserva foi enviada com sucesso!');
        setIsModalOpen(false);
        setRefreshAgendaKey(prevKey => prevKey + 1);
    };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;
    if (!ambiente) return <p>Ambiente não encontrado.</p>;

    return (
        <>
            {isModalOpen && (
                <ReservarModal
                    recurso={{...ambiente, recurso_tipo: 'ambiente'}}
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleReservationSuccess}
                />
            )}

            {/* O div .container é removido, pois o UserLayout já fornece o espaçamento */}
            <div className={styles.pageHeader}>
                <div>
                    <h1>{ambiente.identificacao}</h1>
                    <p>Veja a agenda de horários e solicite sua reserva.</p>
                </div>
                <div className={styles.headerActions}> 
                    <Button as={Link} to={`/${user.tipo}/minhas-reservas?recursoId=${id}&recursoTipo=ambiente`} variant="primary">
                        Minhas Reservas
                    </Button>
                        {user.tipo === 'professor' && (
                    <Button onClick={handleOpenReserveModal} variant="secondary">
                        + Fazer Nova Reserva
                    </Button>
                        )}
                    <Button as={Link} to={homePath} variant="cancel">Voltar para Início</Button>
                </div>
            </div>
            
            {user && (
                <div className={styles.actionsBar}>
                    
                </div>
            )}

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Detalhes do Ambiente</h2>
                </div>
                {/* Aplicamos o estilo de card do UserLayout */}
                <div className={`${styles.card} ${styles.detailsGrid}`}>
                    <p><strong>Tipo:</strong></p> <p>{ambiente.tipo}</p>
                    <p><strong>Status:</strong></p> <p>{ambiente.status}</p>
                    <p><strong>Descrição:</strong></p> <p>{ambiente.descricao || 'N/A'}</p>
                </div>
            </div>
                            
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Equipamentos neste Ambiente</h2>
                </div>
                <div className={styles.card}>
                    <EquipamentosList ambienteId={id} userRole={user?.tipo} />
                </div>
            </div>
            
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Agenda de Reservas</h2>
                </div>
                <div className={styles.card}>
                    <AgendaAmbiente ambienteId={id} refreshKey={refreshAgendaKey} userRole={user?.tipo} />
                </div>
            </div>
        </>
    );
};

export default PublicAmbienteDetalhesPage;
