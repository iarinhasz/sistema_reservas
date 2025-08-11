import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente'; // Importe o novo componente
import { useAuth} from '../../context/AuthContext';
import ReservarModal from '../../components/shared/ReservarModal';

import layout from '../../components/layout/UserLayout.module.css';
import EquipamentosList from '../../components/shared/EquipamentoList'; 
import Button from '../../components/shared/Button'; 

const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [ambiente, setAmbiente] = useState(null);
    
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

            {/* 4. Aplicando os novos estilos de layout e os componentes reutilizáveis */}
            <div className={layout.container}>
                <div className={layout.pageHeader}>
                    <div>
                        <h1>{ambiente.identificacao}</h1>
                        <p>Veja a agenda de horários e solicite sua reserva.</p>
                    </div>
                    <Button as={Link} to="/" variant="cancel">Voltar para Início</Button>
                </div>
                
                {user && (
                    <div className={layout.actionsBar}>
                        <Button as={Link}     to={`/${user.tipo}/minhas-reservas?recursoId=${id}&recursoTipo=ambiente`} variant="primary">
                            Minhas Reservas
                        </Button>

                        {user.tipo === 'professor' && (
                            <Button onClick={handleOpenReserveModal} variant="secondary">
                                + Fazer Nova Reserva
                            </Button>
                        )}

                        {user.tipo === 'aluno' && (
                            <Button as={Link} to={`/aluno/reservar-equipamento/${id}`} variant="secondary">
                                Reservar Equipamento
                            </Button>
                        )}
                    </div>
                )}

                <div className={layout.section}>
                    <div className={layout.sectionHeader}>
                        <h2>Detalhes do Ambiente</h2>
                    </div>
                    <p><strong>Tipo:</strong> {ambiente.tipo}</p>
                    <p><strong>Capacidade:</strong> {ambiente.capacidade} pessoas</p>
                    <p><strong>Descrição:</strong> {ambiente.descricao}</p>
                </div>
                                
                <div className={layout.section}>
                    <div className={layout.sectionHeader}>
                        <h2>Equipamentos neste Ambiente</h2>
                    </div>
                    {/* 5. Usando o componente EquipamentosList para exibir a lista */}
                    <EquipamentosList ambienteId={id} userRole={user?.tipo} />
                </div>
                
                <div className={layout.section}>
                    <div className={layout.sectionHeader}>
                        <h2>Agenda de Reservas</h2>
                    </div>
                    <AgendaAmbiente ambienteId={id} refreshKey={refreshAgendaKey} />
                </div>
            </div>
        </>
    );
};

export default PublicAmbienteDetalhesPage;