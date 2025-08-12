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
import ReviewModal from './reviewModal';
import { useAuth } from '../../context/AuthContext';

import styles from './AgendaAmbiente.module.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });


const EventoPersonalizado = ({ event }) => {
    const startTime = format(event.start, 'HH:mm');
    const endTime = format(event.end, 'HH:mm');
    return (
        <div className={styles.eventoPersonalizado}>
            <strong>{event.title}</strong>
            <p>{`${startTime} - ${endTime}`}</p>
        </div>
    );
};

const AgendaAmbiente = ({ ambienteId, refreshKey }) => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());
    
    const [reservaSelecionada, setReservaSelecionada] = useState(null);
    const [modalAdminAberto, setModalAdminAberto] = useState(false);
    const [modalReviewAberto, setModalReviewAberto] = useState(false);

    const fetchReservas = useCallback(async () => {
        if (!ambienteId) return;
        setLoading(true);
        try {
            const response = await api.get(`/reservas?recurso_id=${ambienteId}&recurso_tipo=ambiente`);
            setReservas(response.data.data || []);
        } catch (err) {
            setError('Não foi possível carregar a agenda.');
        } finally {
            setLoading(false);
        }
    }, [ambienteId]);

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas, refreshKey]);

    const handleReviewSubmit = async ({ rating, comment, reservaId }) => {
        try {
            await api.post(`/reservas/${reservaId}/review`, { nota: rating, comentario: comment });
            alert('Avaliação enviada com sucesso!');
            setModalReviewAberto(false);
            fetchReservas();
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao enviar a avaliação.');
        }
    };

    const handleSelectEvent = useCallback((evento) => {
        const reserva = evento.resource;
        const agora = new Date();
        const dataFim = new Date(reserva.data_fim);

        if (user?.tipo === 'admin') {
            setReservaSelecionada(reserva);
            setModalAdminAberto(true);
            return;
        }

        const isMinhaReserva = reserva.usuario_cpf === user?.cpf;
        const jaTerminou = agora > dataFim;
        const naoFoiAvaliada = reserva.nota === null;

        if (isMinhaReserva && jaTerminou && naoFoiAvaliada) {
            setReservaSelecionada(reserva);
            setModalReviewAberto(true);
        }
    }, [user]);

    const eventPropGetter = useCallback((evento) => {
        const reserva = evento.resource;
        const agora = new Date();
        const dataFim = new Date(reserva.data_fim);
        
        if (user?.tipo === 'admin') {
            return {};
        }

        const isMinhaReserva = reserva.usuario_cpf === user?.cpf;
        
        if (isMinhaReserva) {
            const jaTerminou = agora > dataFim;
            const naoFoiAvaliada = reserva.nota === null;

            if (jaTerminou && naoFoiAvaliada) {
                return { className: 'evento-avaliar' };
            }
            return { className: 'minha-reserva' };
        }
        
        return { className: 'reserva-outros' };

    }, [user]);

    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.titulo,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
        allDay: false,
        resource: reserva,
    })) : [];

    if (loading) return <p>Carregando agenda...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <>
            <div className={styles.calendarWrapper}>
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
                    onNavigate={setDate}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventPropGetter}
                    messages={{ next: "Próxima", previous: "Anterior", today: "Hoje" }}
                    formats={{
                        timeGutterFormat: (date, culture, localizer) => localizer.format(date, 'HH:mm', culture),
                        eventTimeRangeFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'HH:mm', culture)} – ${localizer.format(end, 'HH:mm', culture)}`
                    }}
                    
                    components={{
                        event: EventoPersonalizado,
                    }}
                />
            </div>
            
            {modalAdminAberto && (
                <ReservaDetalhesModal 
                    reserva={reservaSelecionada} 
                    onClose={() => setModalAdminAberto(false)} 
                />
            )}

            {modalReviewAberto && (
                <ReviewModal
                    reserva={reservaSelecionada}
                    onClose={() => setModalReviewAberto(false)}
                    onSubmit={handleReviewSubmit}
                />
            )}
        </>
    );
};
export default AgendaAmbiente;