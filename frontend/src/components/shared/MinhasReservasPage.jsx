import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';
import styles from '../css/MinhasReservasPage.module.css';
import Button from '../shared/Button.jsx';

const MinhasReservasPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Definimos a função de busca aqui usando useCallback
    const fetchMinhasReservas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservas/mine');
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
    }, []);

    // Usamos APENAS UM useEffect para chamar a função
    useEffect(() => {
        if (!authLoading && user) {
            fetchMinhasReservas();
        }
    }, [user, authLoading, fetchMinhasReservas]);


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

    const handleFazerReview = async (reservaId) => {
        const reviewText = prompt("Por favor, deixe sua avaliação sobre esta reserva:");
        if (reviewText) {
            try {
                await api.post(`/reservas/${reservaId}/review`, { review: reviewText });
                alert('Obrigado pelo seu feedback!');
            } catch (err) {
                alert(err.response?.data?.message || 'Erro ao enviar a avaliação.');
            }
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

    // O JSX para renderizar a tabela continua o mesmo
    return (
        <div className={styles.container}>
            <h1>Minhas Reservas</h1>
            {reservas.length === 0 ? (
                <p>Você não tem nenhuma reserva no momento.</p>
            ) : (
                <table className={styles.reservasTable}>
                    <thead>
                        <tr>
                            <th>Recurso</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(reserva => {
                            const isConcluida = new Date() > new Date(reserva.data_fim);
                            const status = isConcluida && reserva.status === 'aprovada' ? 'concluida' : reserva.status;
                            const canCancel = ['aprovada', 'pendente'].includes(reserva.status) && !isConcluida;

                            return (
                                <tr key={reserva.id}>
                                    <td>{reserva.recurso_nome || reserva.titulo}</td>
                                    <td>{new Date(reserva.data_inicio).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[status]}`}>
                                            {status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        {canCancel && (
                                            <Button variant="danger" onClick={() => handleCancelReserva(reserva.id)}>
                                                Cancelar
                                            </Button>
                                        )}
                                        {status === 'concluida' && (
                                            <Button variant="secondary" onClick={() => handleFazerReview(reserva.id)}>
                                                Fazer Review
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MinhasReservasPage;