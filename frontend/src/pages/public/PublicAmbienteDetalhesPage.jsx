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
            recurso={{ ...ambiente, recurso_tipo: 'ambiente' }}
            user={user}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleReservationSuccess}
            />
        )}

        {/* Cabeçalho padronizado */}
        <div className={layout.pageHeader}>
            <h1>{ambiente.identificacao}</h1>

            {/* Troca layout.actionsBar -> layout.pageHeaderActions */}
            <div className={layout.pageHeaderActions}>
            {/* mantém exatamente os mesmos links */}
            <Button as={Link} to="/" variant="cancel">Voltar para Início</Button>

            {user && (
                <>
                <Button
                    as={Link}
                    to={`/${user.tipo}/minhas-reservas?recursoId=${id}&recursoTipo=ambiente`}
                    variant="primary"
                >
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
                </>
            )}
            </div>
        </div>

        {/* Card de detalhes (grid igual das telas internas) */}
        <div className={`${layout.card} ${layout.cardCompact} ${layout.detailsGrid}`}>
            <p><strong>ID:</strong></p> <p>{ambiente.id}</p>
            <p><strong>Tipo:</strong></p> <p>{ambiente.tipo || '—'}</p>
            {ambiente.status && (<><p><strong>Status:</strong></p> <p>{ambiente.status}</p></>)}
            <p><strong>Capacidade:</strong></p> <p>{ambiente.capacidade ?? '—'} pessoas</p>
            <p><strong>Descrição:</strong></p> <p>{ambiente.descricao || '—'}</p>
        </div>

        {/* Equipamentos em card */}
        <div className={layout.section}>
            <div className={layout.sectionHeader}><h2>Equipamentos neste Ambiente</h2></div>
            <div className={layout.card}>
            <EquipamentosList ambienteId={id} userRole={user?.tipo} />
            </div>
        </div>

        {/* Agenda em card */}
        <div className={layout.section}>
            <div className={layout.sectionHeader}><h2>Agenda de Reservas</h2></div>
            <div className={layout.card}>
            <AgendaAmbiente ambienteId={id} refreshKey={refreshAgendaKey} />
            </div>
        </div>
        </>

    );
};

export default PublicAmbienteDetalhesPage;