import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- IMPORTAÇÕES E CONFIGURAÇÃO PARA O CALENDÁRIO ---
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// O componente recebe o ID do ambiente como uma propriedade (prop)
const AgendaAmbiente = ({ ambienteId, refreshKey }) => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReservas = async () => {
            if (!ambienteId) return; // Não faz nada se não receber um ID

            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                
                const response = await axios.get(
                    `http://localhost:3000/api/reservas?recurso_id=${ambienteId}&recurso_tipo=ambiente`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                setReservas(response.data.data || []);
            } catch (err) {
                setError('Não foi possível carregar a agenda.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReservas();
    }, [ambienteId, refreshKey]); // Re-executa se o ID do ambiente mudar

    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.status === 'aprovada' ? `Reservado - ${reserva.titulo}` : `Pendente - ${reserva.titulo}`,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
        allDay: false,
    })) : [];

    if (loading) return <p>Carregando agenda...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div style={{ height: '70vh', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Calendar
                localizer={localizer}
                events={eventosDoCalendario}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                messages={{ next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
            />
        </div>
    );
};

export default AgendaAmbiente;