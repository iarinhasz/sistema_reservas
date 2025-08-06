// src/pages/user/professor/reservarAmbientePage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import styles from '../css/reservarAmbientePage.module.css';

const ReservarAmbientePage = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const response = await api.get('/ambientes');
                setAmbientes(response.data);
            } catch (err) {
                setError('Erro ao carregar a lista de ambientes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbientes();
    }, []);

    const handleReserva = async (ambienteId) => {
        try {
            const reservaData = {
                ambienteId: ambienteId,
                // Exemplo:
                // data: '2025-10-27',
                // horario: '10:00'
                // professorId: user.id
            };
            
            await api.post('/reservas', reservaData);
            alert('Reserva realizada com sucesso!');
        } catch (err) {
            alert('Erro ao realizar a reserva. Tente novamente.');
            console.error(err);
        }
    };

    if (loading) return <p>Carregando ambientes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.container}>
            <h1>Reservar Ambiente</h1>
            {ambientes.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Capacidade</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ambientes.map((ambiente) => (
                            <tr key={ambiente.id}>
                                <td>{ambiente.nome}</td>
                                <td>{ambiente.descricao}</td>
                                <td>{ambiente.tipo}</td>
                                <td>{ambiente.capacidade}</td>
                                <td>
                                    <button
                                        onClick={() => handleReserva(ambiente.id)}
                                        className={styles.button}
                                    >
                                        Reservar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Nenhum ambiente cadastrado.</p>
            )}
        </div>
    );
};

export default ReservarAmbientePage;