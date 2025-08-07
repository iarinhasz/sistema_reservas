import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// --- IMPORTAÇÕES E CONFIGURAÇÃO PARA O CALENDÁRIO ---
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
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
const AgendaAmbiente = ({ ambienteId }) => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());

    const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

    useEffect(() => {
        const fetchReservas = async () => {
            if (!ambienteId) return; // Não faz nada se não receber um ID

            try {
                const token = localStorage.getItem('authToken');
                const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
                
                const response = await axios.get(
                    `http://localhost:3000/api/reservas?recurso_id=${ambienteId}&recurso_tipo=ambiente`,
                    config
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
    }, [ambienteId, date]); // Re-executa se o ID do ambiente mudar

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
                culture='pt-BR'
                events={eventosDoCalendario}
                startAccessor="start"
                endAccessor="end"
                defaultView={Views.WEEK}
                toolbar={true}
                views={[Views.WEEK]}
                date={date}
                onNavigate={handleNavigate}
                messages={{
                    next: "Próxima",
                    today: "Atual",
                    previous: "Anterior",                    
                }}
                formats={{
                    timeGutterFormat: (date, culture, localizer) =>
                      localizer.format(date, 'HH:mm', culture),
                    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                      `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`,
                    headerFormat: (date, culture, localizer) =>
                       localizer.format(date, 'MMMM yyyy', culture)
                       .replace(/^\w/, (c) => c.toUpperCase()),
                    dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
                        const startMonth = localizer.format(start, 'MMMM', culture);
                        const endMonth = localizer.format(end, 'MMMM', culture);

                        // Formata o texto, capitalizando o mês de início
                        const formattedStart = `${localizer.format(start, 'dd')} de ${startMonth.replace(/^\w/, c => c.toUpperCase())}`;
                        
                        // Se a semana abrange dois meses diferentes (ex: 31 de Ago - 06 de Set)
                        if (startMonth !== endMonth) {
                            const formattedEnd = `${localizer.format(end, 'dd')} de ${endMonth.replace(/^\w/, c => c.toUpperCase())}`;
                            return `${formattedStart} – ${formattedEnd}`;
                        }
                        
                        // Se a semana está dentro do mesmo mês
                        return `${formattedStart} – ${localizer.format(end, 'dd')}`;
                    }
                }}
            />
        </div>
    );
};

export default AgendaAmbiente;