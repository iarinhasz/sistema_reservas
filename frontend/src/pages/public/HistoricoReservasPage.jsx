import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import layoutStyles from '@/styles/Layout.module.css';
import tableStyles from '@/styles/Table.module.css';
import Button from '@/components/shared/Button.jsx';

const HistoricoReservasPage = () => {
    const { id } = useParams();
    const [reservas, setReservas] = useState([]);
    const [ambiente, setAmbiente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ambienteRes, historicoRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/reservas/historico/ambiente/${id}`)
                ]);
                setAmbiente(ambienteRes.data);
                setReservas(historicoRes.data.data || []);
            } catch (err) {
                setError('Não foi possível carregar o histórico de reservas.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <p>Carregando histórico...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <>
            <div className={layoutStyles.pageHeader}>
                <h1>Histórico de Reservas: {ambiente?.identificacao}</h1>
                <Button as={Link} to={`/admin/ambientes/${id}`} variant="cancel">
                    Voltar ao Ambiente
                </Button>
            </div>

            {reservas.length === 0 ? (
                <p>Nenhuma reserva encontrada para este ambiente.</p>
            ) : (
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Título da Reserva</th>
                            <th>Status</th>
                            <th>Solicitante</th>
                            <th>Perfil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(reserva => (
                            <tr key={reserva.id}>
                                <td>{new Date(reserva.data_inicio).toLocaleDateString()}</td>
                                <td>
                                    {`${new Date(reserva.data_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(reserva.data_fim).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                </td>
                                <td>{reserva.titulo}</td>
                                <td>
                                    <span className={`${tableStyles.status} ${tableStyles[reserva.status]}`}>
                                        {reserva.status}
                                    </span>
                                </td>
                                <td>{reserva.usuario_nome}</td>
                                <td>{reserva.usuario_tipo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default HistoricoReservasPage;
