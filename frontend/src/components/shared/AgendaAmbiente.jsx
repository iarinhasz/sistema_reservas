// frontend/src/components/shared/AgendaAmbiente.jsx

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Importe os dois tipos de modais que a agenda pode abrir
import ReservaDetalhesModal from './ReservaDetalhesModal';
import ReviewModal from './reviewModal';
import { useAuth } from '../../context/AuthContext';

import styles from './AgendaAmbiente.module.css';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const AgendaAmbiente = ({ ambienteId, refreshKey }) => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [date, setDate] = useState(new Date());
    
    // Estados para controlar qual reserva foi clicada e qual modal abrir
    const [reservaSelecionada, setReservaSelecionada] = useState(null);
    const [modalAdminAberto, setModalAdminAberto] = useState(false);
    const [modalReviewAberto, setModalReviewAberto] = useState(false);

    // Busca as reservas da API
    const fetchReservas = useCallback(async () => {
        if (!ambienteId) return;
        setLoading(true);
        try {
            const response = await api.get(`/reservas?recurso_id=${ambienteId}&recurso_tipo=ambiente`);
            setReservas(response.data.data || []);
        } catch (err) {
            setError('Não foi possível carregar a agenda.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [ambienteId]);

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas, refreshKey]);

    // Função para lidar com o envio de um novo review
    const handleReviewSubmit = async ({ rating, comment, reservaId }) => {
        try {
            await api.post(`/reservas/${reservaId}/review`, { nota: rating, comentario: comment });
            alert('Avaliação enviada com sucesso!');
            setModalReviewAberto(false);
            fetchReservas(); // Atualiza a agenda para que a cor do evento mude
        } catch (err) {
            alert(err.response?.data?.message || 'Erro ao enviar a avaliação.');
        }
    };

    // Função que decide o que fazer quando um evento é clicado
    const handleSelectEvent = useCallback((evento) => {
        const reserva = evento.resource;
        const agora = new Date();
        const dataFim = new Date(reserva.data_fim);

        // Lógica para Administradores
        if (user?.tipo === 'admin') {
            setReservaSelecionada(reserva);
            setModalAdminAberto(true);
            return;
        }

        // Lógica para Professores e Alunos
        const isMinhaReserva = reserva.usuario_cpf === user?.cpf;
        const jaTerminou = agora > dataFim;
        const naoFoiAvaliada = reserva.nota === null;

        if (isMinhaReserva && jaTerminou && naoFoiAvaliada) {
            setReservaSelecionada(reserva);
            setModalReviewAberto(true);
        }
    }, [user]);

    // Função que define a cor de cada evento no calendário
    const eventPropGetter = useCallback((evento) => {
        const reserva = evento.resource;
        const agora = new Date();
        const dataFim = new Date(reserva.data_fim);
        
        if (user?.tipo === 'admin') {
            return {}; // Cor padrão para admin
        }

        const isMinhaReserva = reserva.usuario_cpf === user?.cpf;
        
        if (isMinhaReserva) {
            const jaTerminou = agora > dataFim;
            const naoFoiAvaliada = reserva.nota === null;

            if (jaTerminou && naoFoiAvaliada) {
                return { className: 'evento-avaliar' }; // Verde
            }
            return { className: 'minha-reserva' }; // Azul/Ciano
        }
        
        return { className: 'reserva-outros' }; // Cinza

    }, [user]);

    
    // Mapeia os dados das reservas para o formato que o calendário entende
    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.titulo,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
        allDay: false,
        resource: reserva, // Guarda o objeto original completo da reserva
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
                />
            </div>
            
            {/* Modal de detalhes para o Admin */}
            {modalAdminAberto && (
                <ReservaDetalhesModal 
                    reserva={reservaSelecionada} 
                    onClose={() => setModalAdminAberto(false)} 
                />
            )}

            {/* Modal de review para Alunos/Professores */}
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