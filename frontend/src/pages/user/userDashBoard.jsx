import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
// import Calendar from 'react-calendar'; // Exemplo de biblioteca de calendário
import styles from './AmbientePublicoPage.module.css';


const userDashBoard = () =>{
    const { id } = useParams();
    const { user } = useAuth();

    const [ambiente, setAmbiente] = useState(null);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ambienteRes = await api.get(`/ambientes/${id}`);
                setAmbiente(ambienteRes.data);

                // Busca as reservas para este ambiente
                const reservasRes = await api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente`);
                setReservas(reservasRes.data);
            } catch (error) {
                console.error("Erro ao buscar dados do ambiente", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    const renderBotaoReserva = () => {
        if (!user) return null; // Não mostra botão se não estiver logado

        switch (user.tipo) {
            case 'professor':
                return <button className={styles.reserveButton}>Reservar Ambiente</button>;
            case 'aluno':
                return <button className={styles.reserveButton}>Reservar Equipamento</button>;
            // Admin também pode ter um botão, se desejado
            case 'admin':
                return <button className={styles.reserveButton}>Fazer Reserva (Admin)</button>;
            default:
                return null;
        }
    };

    return (
        <div className={styles.container}>
            <h1>{ambiente.identificacao}</h1>
            <p>Agenda de horários e disponibilidade.</p>
            
            {renderBotaoReserva()}

            <div className={styles.agendaContainer}>
                <h3>Horários Reservados</h3>
                {/* Aqui você pode integrar um componente de calendário mais robusto no futuro */}
                <ul>
                    {reservas.length > 0 ? reservas.map(reserva => (
                        <li key={reserva.id}>
                            Reservado de {new Date(reserva.data_inicio).toLocaleString()} até {new Date(reserva.data_fim).toLocaleString()}
                        </li>
                    )) : <p>Nenhum horário reservado para este ambiente.</p>}
                </ul>
            </div>
        </div>
    );
};

export default userDashBoard;