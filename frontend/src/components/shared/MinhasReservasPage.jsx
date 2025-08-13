import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import Button from '../shared/Button.jsx';
import ReviewModal from './reviewModal.jsx';

import layoutStyles from '../layout/UserLayout.module.css';
import tableStyles from '../../styles/Table.module.css';


const MinhasReservasPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchParams] = useSearchParams();
    
    const recursoId = searchParams.get('recursoId');
    const recursoTipo = searchParams.get('recursoTipo');

    // Estados para o modal de review
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);

    // Estado para o filtro de status
    const [filtroStatus, setFiltroStatus] = useState('todos');

    // Definimos a função de busca aqui usando useCallback
    const fetchMinhasReservas = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};

            if (recursoId) params.recursoId = recursoId;
            if (recursoTipo) params.recursoTipo = recursoTipo;

            const response = await api.get('/reservas/mine', { params });
            
            const reservasData = response.data.data;
            setReservas(Array.isArray(reservasData) ? reservasData : []);
        
            setError('');
        } catch (err) {
            console.log('Resposta da API /reservas/mine:', response.data);
            console.error("Erro ao buscar reservas", err);
            setError('Não foi possível carregar suas reservas.');
        } finally {
            setLoading(false);
        }
    }, [recursoId, recursoTipo]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchMinhasReservas();
        }
    }, [user, authLoading, fetchMinhasReservas]);

    const sortedAndFilteredReservas = useMemo(() => {
            const statusOrder = { 'pendente': 1, 'aprovada': 2,'concluida': 3, 'cancelada': 4, 'rejeitada': 5 };

            return reservas
                .map(r => {
                    const agora = new Date();
                    const dataFim = new Date(r.data_fim);
                    let statusCalculado = r.status;

                    if (r.status === 'aprovada') {
                        if (agora > dataFim) statusCalculado = 'concluida';
                    }
                    return { ...r, statusCalculado };
                })
                .filter(r => filtroStatus === 'todos' || r.statusCalculado === filtroStatus) // Filtra primeiro
                .sort((a, b) => statusOrder[a.statusCalculado] - statusOrder[b.statusCalculado]); // Ordena depois
        }, [reservas, filtroStatus]);
    const handleCancelReserva = async (reservaId) => {
        if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
        try {
            await api.put(`/reservas/${reservaId}/cancelar`);
            alert('Reserva cancelada com sucesso!');
            setReservas(currentReservas => currentReservas.filter(r => r.id !== reservaId));
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao cancelar a reserva.');
        }
    };
    if (authLoading) {
        return <p>Verificando autenticação...</p>;
    }
    
    if (loading) {
        return <p>Carregando suas reservas...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    

    const handleOpenReviewModal = (reserva) => {
        setSelectedReserva(reserva);
        setReviewModalOpen(true);
    };
    const handleReviewSubmit = async ({ rating, comment, reservaId }) => {
        //console.log('FRONTEND: Dados recebidos do modal:', rating, comment, reservaId); 

        try {
            await api.post(`/reservas/${reservaId}/review`, { nota: rating, comentario: comment }); // Corrigido para enviar nota e comentario
            alert('Obrigado pelo seu feedback!');
            setReviewModalOpen(false);
            fetchMinhasReservas();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao enviar a avaliação.');
        }
    };
    const handleShowRejectionReason = (motivo) => {
        alert(`Motivo da Rejeição/Cancelamento:\n\n${motivo}`);
    };

    return (
        <>
            {isReviewModalOpen && (
                    <ReviewModal
                        reserva={selectedReserva}
                        onClose={() => setReviewModalOpen(false)}
                        onSubmit={handleReviewSubmit}
                    />
                )}

            <div className={layoutStyles.container}>
                <div className={layoutStyles.pageHeader}>
                    <h1>
                        {recursoId ? `Meu Histórico para ${recursoTipo}` : 'Minhas Reservas'}
                    </h1>
                </div>

                <div className={layoutStyles.filterContainer}>
                    <span>Filtrar por:</span>
                        <Button variant={filtroStatus === 'todos' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('todos')}>Todos</Button>
                        <Button variant={filtroStatus === 'pendente' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('pendente')}>Pendentes</Button>
                        <Button variant={filtroStatus === 'aprovada' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('aprovada')}>Aprovadas</Button>
                        <Button variant={filtroStatus === 'concluida' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('concluida')}>Concluídas</Button>
                        <Button variant={filtroStatus === 'cancelada' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('cancelada')}>Canceladas</Button>
                        <Button variant={filtroStatus === 'rejeitada' ? 'primary' : 'cancel'} onClick={() => setFiltroStatus('rejeitada')}>Rejeitadas</Button>
                </div>

                {sortedAndFilteredReservas.length === 0 ? (
                    <p>Você não tem nenhuma reserva para o filtro selecionado.</p>
                ) : (
                    <div className={layoutStyles.card}> 
                        <table className={tableStyles.table}>
                            <thead>
                                <tr>
                                    <th>Recurso</th>
                                    <th>Data</th>
                                    <th className={tableStyles.statusColumn}>Status</th>
                                    <th className={tableStyles.actionsCell}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredReservas.map(reserva => {
                                    const { statusCalculado, motivo_rejeicao } = reserva;
                                    const canCancel = ['pendente', 'aprovada', 'andamento'].includes(statusCalculado);
                                    const isClickable = ['cancelada', 'rejeitada'].includes(statusCalculado) && motivo_rejeicao;

                                    return (
                                        <tr key={reserva.id}>
                                            <td>{reserva.recurso_nome || reserva.titulo}</td>
                                            <td>{new Date(reserva.data_inicio).toLocaleDateString()}</td>
                                            <td className={tableStyles.statusColumn}>
                                                <span 
                                                    className={`${tableStyles.status} ${tableStyles[statusCalculado]} ${isClickable ? tableStyles.statusClickable : ''}`}
                                                    onClick={() => isClickable && handleShowRejectionReason(motivo_rejeicao)}
                                                    title={isClickable ? 'Clique para ver o motivo' : ''}
                                                >
                                                    {statusCalculado}
                                                </span>
                                                    
                                            </td>
                                            <td className={tableStyles.actionsCell}>
                                                {canCancel && (
                                                    <Button variant="danger" onClick={() => handleCancelReserva(reserva.id)}>
                                                        Cancelar
                                                    </Button>
                                                )}
                                                {statusCalculado === 'concluida' && !reserva.nota && (
                                                    <Button variant="secondary" onClick={() => handleOpenReviewModal(reserva)}>
                                                        Fazer Review
                                                    </Button>
                                                )}
                                                {reserva.nota && statusCalculado === 'concluida' && (
                                                    <span className={tableStyles.reviewedMessage}>Já Avaliado ({reserva.nota} ★)</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    )}
            </div>
        </>
    );
};

export default MinhasReservasPage;