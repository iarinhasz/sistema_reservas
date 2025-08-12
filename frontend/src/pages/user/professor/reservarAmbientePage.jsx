import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import styles from '../css/reservarAmbientePage.module.css';

const ReservarAmbientePage = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();


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

    const handleReservarClick = (ambienteId) => {
        navigate(`/professor/ambientes/${ambienteId}`);
    };

    if (loading) return <p>Carregando ambientes...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.pageContainer}>
            <h1>Reservar Ambiente</h1>
            <p>Selecione um ambiente abaixo para ver os detalhes e solicitar uma reserva.</p>
            <div className={styles.ambientesList}>
                {ambientes.map(ambiente => (
                    <div key={ambiente.id} className={styles.ambienteCard}>
                        <div className={styles.cardInfo}>
                            <h3>{ambiente.identificacao}</h3>
                            <p>Capacidade: {ambiente.capacidade} pessoas</p>
                        </div>
                        <button
                            onClick={() => handleReservarClick(ambiente.id)}
                            className={styles.reservarButton}
                        >
                            Reservar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReservarAmbientePage;