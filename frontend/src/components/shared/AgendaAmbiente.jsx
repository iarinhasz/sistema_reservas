import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ReservaDetalhesModal from './ReservaDetalhesModal';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const AgendaAmbiente = ({ ambienteId, userRole = 'visitante' }) => {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());
    const [modalAberta, setModalAberta] = useState(false);
    const [reservaSelecionada, setReservaSelecionada] = useState(null);

    const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);

    useEffect(() => {
        const fetchReservas = async () => {
            if (!ambienteId) return;
            try {
                const response = await api.get(`/reservas?recurso_id=${ambienteId}&recurso_tipo=ambiente`);
                setReservas(response.data.data || []);
            } catch (err) {
                setError('Não foi possível carregar a agenda.');
                console.error(err);
            } finally {
                if (loading) setLoading(false);
            }
        };
        fetchReservas();
    }, [ambienteId, date]);

    const handleSelectEvent = useCallback((evento) => {
        if (userRole === 'admin') {
            setReservaSelecionada(evento.resource);
            setModalAberta(true);
        }
    }, [userRole]);

    

    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.status === 'aprovada' ? `Reservado - ${reserva.titulo}` : `Pendente - ${reserva.titulo}`,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
        allDay: false,
        resource: reserva,
    })) : [];

    if (loading) return <p>Carregando agenda...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <>
            <div style={{ height: '70vh', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <Calendar
                    localizer={localizer}
                    culture='pt-BR'
                    events={eventosDoCalendario}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.WEEK}
                    views={[Views.WEEK]}
                    toolbar={true}
                    date={date}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={() => ({ style: { cursor: userRole === 'admin' ? 'pointer' : 'default' } })}
                    messages={{ next: "Próxima", previous: "Anterior", today: "Hoje" }}
                    formats={{
                        timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
                        eventTimeRangeFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`,
                        headerFormat: (date, culture, localizer) => localizer.format(date, 'MMMM yyyy', culture).replace(/^\w/, (c) => c.toUpperCase()),
                        dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
                            const startMonth = localizer.format(start, 'MMMM', culture).replace(/^\w/, c => c.toUpperCase());
                            const endMonth = localizer.format(end, 'MMMM', culture).replace(/^\w/, c => c.toUpperCase());
                            if (startMonth !== endMonth) return `${localizer.format(start, 'dd')} de ${startMonth} – ${localizer.format(end, 'dd')} de ${endMonth}`;
                            return `${localizer.format(start, 'dd')} – ${localizer.format(end, 'dd')} de ${startMonth}`;
                        }
                    }}
                />
            </div>
            {modalAberta && (
                <ReservaDetalhesModal 
                    reserva={reservaSelecionada} 
                    onClose={() => setModalAberta(false)} 
                />
            )}
        </>
    );
};
export default AgendaAmbiente;