// src/pages/user/professor/MinhasReservasPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import styles from '../css/minhasReservasPage.module.css';

const MinhasReservasPage = () => {
    const { user } = useAuth(); // Assume que o user contém o ID do professor
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReservas = async () => {
            if (!user || !user.id) {
                setError('ID do usuário não encontrado.');
                setLoading(false);
                return;
            }
            try {
                // Suponha que sua API tenha uma rota para buscar reservas por ID do professor
                const response = await api.get(`/reservas/professor/${user.id}`);
                setReservas(response.data);
            } catch (err) {
                setError('Erro ao carregar suas reservas.');
                console.error("Erro ao buscar reservas:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReservas();
    }, [user]);

    if (loading) {
        return <p>Carregando suas reservas...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className={styles.container}>
            <h1>Minhas Reservas</h1>
            {reservas.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ambiente</th>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Status</th>
                            {/* Adicione outras colunas conforme necessário */}
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map(reserva => (
                            <tr key={reserva.id}>
                                {/* Suponha que o objeto de reserva inclua detalhes do ambiente */}
                                <td>{reserva.ambiente.nome}</td>
                                <td>{reserva.data}</td>
                                <td>{reserva.horario}</td>
                                <td>{reserva.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Você não tem nenhuma reserva no momento.</p>
            )}
        </div>
    );
};

export default MinhasReservasPage;