
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './css/AmbienteDetalhesPage.module.css'; // Crie um CSS para esta página

// --- IMPORTAÇÕES PARA O CALENDÁRIO ---
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Importa o CSS da biblioteca
// --- CONFIGURAÇÃO DO CALENDÁRIO ---
const locales = {
    'pt-BR': (await import('date-fns/locale/pt-BR')).default,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const AmbienteDetalhesPage = () => {
    // useParams pega os parâmetros da URL, neste caso o 'id'
    const { id } = useParams();

    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [reservas, setReservas] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Requisição 1: Busca os dados do ambiente
                const ambienteRes = await api.get(`/ambientes/${id}`);
                setAmbiente(ambienteRes.data);

                // Requisição 2: Busca os equipamentos filtrando pelo ID do ambiente
                const equipamentosRes = await api.get(`/equipamentos?ambienteId=${id}`);
                setEquipamentos(equipamentosRes.data);
                
                //Requisição 3: Busca as reservas pelo id
                const reservasRes = await api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente`);
                setReservas(reservasRes.data);

            } catch (err) {
                setError('Falha ao carregar dados. Verifique se o ambiente existe.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]); // Roda o efeito sempre que o 'id' na URL mudar
    
    // --- TRANSFORMAÇÃO DOS DADOS ---
    // Transforma nossas reservas no formato que o calendário entende
    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.titulo,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
        allDay: false,
    })) : [];


    if (loading) return <p>Carregando...</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Detalhes de: {ambiente?.identificacao}</h1>
                <div className={styles.actions}>
                    <button className={styles.actionButton}>Editar Dados do Ambiente</button>
                    <button className={styles.reserveButton}>Fazer Reserva</button>
                </div>
            </div>
            
            <div className={styles.detailsGrid}>
                <p><strong>ID:</strong> {ambiente?.id}</p>
                <p><strong>Tipo:</strong> {ambiente?.tipo}</p>
                <p><strong>Status:</strong> {ambiente?.status}</p>
            </div>

            <hr />
            <div className={styles.equipamentosSection}>
                <div className={styles.equipamentosHeader}>
                    <h2>Equipamentos neste Ambiente</h2>
                    <button className={styles.addButton}>+ Inserir Equipamento</button>
                </div>
                {equipamentos.length > 0 ? (
                    <table className={styles.equipamentosTable}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipamentos.map(eq => (
                                <tr key={eq.id}>
                                    <td>{eq.nome}</td>
                                    <td>{eq.marca || 'N/A'}</td>
                                    <td>{eq.modelo || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Nenhum equipamento cadastrado para este ambiente.</p>
                )}
            </div>

            <hr />

            <div className={styles.agendaSection}>
                <h2>Agenda de Reservas</h2>
                <div style={{ height: '600px' }}> {/* O calendário precisa de uma altura definida */}
                    <Calendar
                        localizer={localizer}
                        events={eventosDoCalendario}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="week" // Visão padrão pode ser 'month', 'week', 'day', 'agenda'
                        messages={{
                            next: "Próximo",
                            previous: "Anterior",
                            today: "Hoje",
                            month: "Mês",
                            week: "Semana",
                            day: "Dia"
                        }}
                    />
                </div>
            </div>

            <hr />

            
        </div>
    );
};

export default AmbienteDetalhesPage;