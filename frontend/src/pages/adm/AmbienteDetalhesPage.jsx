// frontend/src/pages/adm/AmbienteDetalhesPage.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdicionarEquipamentoModal from '../../components/adm/adicionarEquipamentoModal.jsx';
import EditarAmbienteModal from '../../components/adm/editarAmbienteModal.jsx';
import EditarEquipamentoModal from '../../components/adm/editarEquipamentoModal.jsx';
import api from '../../services/api';
import styles from './css/AmbienteDetalhesPage.module.css';
import { MenuIcon, ProfileIcon, LogoutIcon, EditIcon } from '../../components/icons/index';



// --- IMPORTAÇÕES E CONFIGURAÇÃO PARA O CALENDÁRIO ---
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR'; // Importação estática do locale
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
// --- FIM DA CONFIGURAÇÃO DO CALENDÁRIO ---

const AmbienteDetalhesPage = () => {
    const { id } = useParams();

    // --- ESTADOS DO COMPONENTE ---
    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estado para controlar o modal de adicionar equipamento
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [equipamentoParaEditar, setEquipamentoParaEditar] = useState(null);
    const [isEditAmbienteModalOpen, setIsEditAmbienteModalOpen] = useState(false);

    // --- LÓGICA DE BUSCA DE DADOS ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Requisições em paralelo para mais performance
                const [ambienteRes, equipamentosRes, reservasRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/equipamentos?ambienteId=${id}`),
                    api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente`)
                ]);

                setAmbiente(ambienteRes.data);
                setEquipamentos(equipamentosRes.data);
                setReservas(reservasRes.data);
                setError('');
            } catch (err) {
                setError('Falha ao carregar dados. Verifique se o ambiente existe.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // --- HANDLERS (FUNÇÕES DE AÇÃO) ---
    const handleEquipamentoAdicionado = (novoEquipamento) => {
        // Atualiza a lista na tela sem precisar recarregar a página
        setEquipamentos(listaAtual => [...listaAtual, novoEquipamento]);
    };
    const handleOpenEditModal = (equipamento) => {
        setEquipamentoParaEditar(equipamento);
        setIsEditModalOpen(true);
    };
    const handleEquipamentoAtualizado = (equipamentoAtualizado) => {
        setEquipamentos(listaAtual => 
            listaAtual.map(eq => 
                eq.id === equipamentoAtualizado.id ? equipamentoAtualizado : eq
            )
        );
    };
    const handleEquipamentoDeletado = (equipamentoId) => {
        setEquipamentos(listaAtual => 
            listaAtual.filter(eq => eq.id !== equipamentoId)
        );
        setIsEditModalOpen(false);
    };
    const handleAmbienteAtualizado = (ambienteAtualizado) => {
        setAmbiente(ambienteAtualizado);
    };
    // --- PREPARAÇÃO DE DADOS PARA O CALENDÁRIO ---
    const eventosDoCalendario = Array.isArray(reservas) ? reservas.map(reserva => ({
        title: reserva.titulo,
        start: new Date(reserva.data_inicio),
        end: new Date(reserva.data_fim),
    })) : [];

    // --- RENDERIZAÇÃO ---
    if (loading) return <p>Carregando...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!ambiente) return <p>Ambiente não encontrado.</p>;

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Detalhes de: {ambiente.identificacao}</h1>
                    <div className={styles.actions}>
                        <button className={styles.actionButton} onClick={() => setIsEditAmbienteModalOpen(true)}>
                           <EditIcon /> Editar Dados do Ambiente
                        </button>
                        <button className={styles.reserveButton}>Fazer Reserva</button>
                    </div>
                </div>

                <div className={styles.detailsGrid}>
                    <p><strong>ID:</strong> {ambiente.id}</p>
                    <p><strong>Tipo:</strong> {ambiente.tipo}</p>
                    <p><strong>Status:</strong> {ambiente.status}</p>
                </div>

                <hr />

                <div className={styles.equipamentosSection}>
                    <div className={styles.equipamentosHeader}>
                        <h2>Equipamentos neste Ambiente</h2>
                        <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
                            + Inserir Equipamento
                        </button>
                    </div>
                    {equipamentos.length > 0 ? (
                    <table className={styles.equipamentosTable}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Quantidade</th>
                                <th>Adicionado Por</th> 
                                <th>Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {equipamentos.map(eq => (
                                <tr key={eq.id}>
                                    <td>{eq.nome}</td>
                                    <td>{eq.marca || 'N/A'}</td>
                                    <td>{eq.modelo || 'N/A'}</td>
                                    <td>{eq.quantidade_total || 1}</td>
                                    <td>{eq.criado_por_nome || 'N/A'}</td> 
                                    <td>
                                        <button onClick={() => handleOpenEditModal(eq)} className={styles.iconButton} title="Editar Equipamento"><EditIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>                        
                    </table>) : ( <p>Nenhum equipamento cadastrado para este ambiente.</p> )}
                </div>

                <hr />

                <div className={styles.agendaSection}>
                    <h2>Agenda de Reservas</h2>
                    <div style={{ height: '600px' }}>
                        <Calendar
                            localizer={localizer}
                            events={eventosDoCalendario}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView="week"
                            messages={{ next: "Próximo", previous: "Anterior", today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
                        />
                    </div>
                </div>
            </div>

            {/* O MODAL SERÁ RENDERIZADO AQUI QUANDO isModalOpen FOR true */}
            {isModalOpen && (
                <AdicionarEquipamentoModal
                    ambienteId={id}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleEquipamentoAdicionado}
                />
            )}
            {isEditModalOpen && (
                <EditarEquipamentoModal
                    equipamento={equipamentoParaEditar}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleEquipamentoAtualizado}
                    onDelete={handleEquipamentoDeletado} 
                />
            )}
            {isEditAmbienteModalOpen && (
                <EditarAmbienteModal
                    ambiente={ambiente}
                    onClose={() => setIsEditAmbienteModalOpen(false)}
                    onSuccess={handleAmbienteAtualizado}
                />
            )}
        </>
    );
};

export default AmbienteDetalhesPage;