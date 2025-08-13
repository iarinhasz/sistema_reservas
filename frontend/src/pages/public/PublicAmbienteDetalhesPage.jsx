import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente';
import { useAuth} from '../../context/AuthContext';
import ReservarModal from '../../components/shared/ReservarModal';
import styles from '../../components/layout/UserLayout.module.css'; 
import EquipamentosList from '../../components/shared/EquipamentoList'; 
import Button from '../../components/shared/Button'; 
import FormularioReservaEquipamento from '../../components/shared/FormularioReservaEquipamento.jsx';

const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshAgendaKey, setRefreshAgendaKey] = useState(0);

    const homePath = user ? `/${user.tipo}` : '/';

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const [ambienteRes, equipamentosRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/equipamentos?ambienteId=${id}`)
                ]);
                setAmbiente(ambienteRes.data);
                setEquipamentos(equipamentosRes.data|| []);
            } catch (err) {
                setError('Falha ao carregar dados da página.');
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [id]);

    const handleReservationSuccess = () => {
        alert('Sua solicitação de reserva foi enviada com sucesso!');
        setIsModalOpen(false);
        setRefreshAgendaKey(prevKey => prevKey + 1);
    };

    if (loading) return <p>A carregar...</p>;
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

            <div className={styles.pageHeader}>
                <div>
                    <h1>{ambiente.identificacao}</h1>
                    <p>Veja a agenda de horários e solicite sua reserva.</p>
                </div>
                
                <div className={styles.headerActions}> 
                    {user && (
                        <>
                            <Button as={Link} to={`/${user.tipo}/minhas-reservas?recursoId=${id}&recursoTipo=ambiente`} variant="primary">
                                Minhas Reservas
                            </Button>

                            {user.tipo === 'professor' && (
                                <Button onClick={() => setIsModalOpen(true)} variant="secondary">
                                    + Fazer Nova Reserva
                                </Button>
                            )}
                        </>
                    )}
                    <Button as={Link} to={homePath} variant="cancel">Voltar para Início</Button>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Equipamentos neste Ambiente</h2>
                </div>
                <div className={styles.card}>
                    <EquipamentosList equipamentos={equipamentos} userRole={user?.tipo} />
                </div>
            </div>

            {user?.tipo === 'aluno' && equipamentos && equipamentos.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Solicitar Reserva de Equipamento</h2>
                    </div>
                    <div className={styles.card}>
                        <FormularioReservaEquipamento 
                            equipamentos={equipamentos} 
                            onSuccess={handleReservationSuccess} 
                        />
                    </div>
                </div>
            )}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Agenda de Reservas do Ambiente</h2>
                </div>
                <div className={styles.card}>
                    <AgendaAmbiente ambienteId={id} refreshKey={refreshAgendaKey} userRole={user?.tipo} />
                </div>
            </div>

            
        </>
    );
};

export default PublicAmbienteDetalhesPage;
