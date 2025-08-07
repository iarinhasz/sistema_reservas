import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdicionarEquipamentoModal from '../../components/adm/adicionarEquipamentoModal.jsx';
import EditarAmbienteModal from '../../components/adm/editarAmbienteModal.jsx';
import EditarEquipamentoModal from '../../components/adm/editarEquipamentoModal.jsx';
import ReservarModal from '../../components/adm/ReservarModal.jsx';
import api from '../../services/api';
import styles from './css/AmbienteDetalhesPage.module.css';
import { EditIcon } from '../../components/icons/index';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente.jsx';

const AmbienteDetalhesPage = () => {
    const { id } = useParams();
    const [ambiente, setAmbiente] = useState(null);
    const [equipamentos, setEquipamentos] = useState([]);
    const [solicitacoesReserva, setSolicitacoesReserva] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isAdicionarEquipamentoOpen, setAdicionarEquipamentoOpen] = useState(false);
    const [isEditEquipamentoOpen, setEditEquipamentoOpen] = useState(false);
    const [equipamentoParaEditar, setEquipamentoParaEditar] = useState(null);
    const [isEditAmbienteOpen, setEditAmbienteOpen] = useState(false);
    const [isReservarOpen, setReservarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [ambienteRes, equipamentosRes, solicitacoesRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/equipamentos?ambienteId=${id}`),
                    api.get(`/reservas?recurso_id=${id}&recurso_tipo=ambiente&status=pendente`)
                ]);
                setAmbiente(ambienteRes.data);
                setEquipamentos(equipamentosRes.data);
                setSolicitacoesReserva(solicitacoesRes.data.data || []);
                setError('');
            } catch (err) {
                setError('Falha ao carregar dados. Verifique se o ambiente existe.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, refreshKey]);

    const handleReservaAction = async (action, reservaId) => {
        try {
            await api.put(`/reservas/${reservaId}/${action}`, {});
            setSolicitacoesReserva(prev => prev.filter(r => r.id !== reservaId));
            setRefreshKey(prevKey => prevKey + 1); 
        } catch (err) {
            alert(`Erro ao ${action}r reserva.`);
            console.error(err);
        }
    };
    const handleReservaSuccess = () => { setRefreshKey(prevKey => prevKey + 1) };
    const handleEquipamentoAdicionado = (novoEquipamento) => { setEquipamentos(listaAtual => [...listaAtual, novoEquipamento]) };
    const handleOpenEditModal = (equipamento) => { setEquipamentoParaEditar(equipamento); setEditEquipamentoOpen(true) };
    const handleEquipamentoAtualizado = (equipamentoAtualizado) => { setEquipamentos(listaAtual => listaAtual.map(eq => eq.id === equipamentoAtualizado.id ? equipamentoAtualizado : eq)) };
    const handleEquipamentoDeletado = (equipamentoId) => { setEquipamentos(listaAtual => listaAtual.filter(eq => eq.id !== equipamentoId)); setEditEquipamentoOpen(false) };
    const handleAmbienteAtualizado = (ambienteAtualizado) => { setAmbiente(ambienteAtualizado) };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!ambiente) return <p>Ambiente não encontrado.</p>;

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Detalhes de: {ambiente.identificacao}</h1>
                    <div className={styles.actions}>
                        <button className={styles.actionButton} onClick={() => setEditAmbienteOpen(true)}><EditIcon /> Editar Dados do Ambiente</button>
                        <button className={styles.reserveButton} onClick={() => setReservarOpen(true)}>Fazer Reserva</button>
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
                        <button className={styles.addButton} onClick={() => setAdicionarEquipamentoOpen(true)}>+ Inserir Equipamento</button>
                    </div>
                    {equipamentos.length > 0 ? (
                    <table className={styles.equipamentosTable}>
                         <thead><tr><th>Nome</th><th>Marca</th><th>Modelo</th><th>Quantidade</th><th>Adicionado Por</th><th>Editar</th></tr></thead>
                        <tbody>
                            {equipamentos.map(eq => (
                                <tr key={eq.id}>
                                    <td>{eq.nome}</td><td>{eq.marca || 'N/A'}</td><td>{eq.modelo || 'N/A'}</td>
                                    <td>{eq.quantidade_total || 1}</td><td>{eq.criado_por_nome || 'N/A'}</td> 
                                    <td><button onClick={() => handleOpenEditModal(eq)} className={styles.iconButton} title="Editar Equipamento"><EditIcon/></button></td>
                                </tr>
                            ))}
                        </tbody>                        
                    </table>) : ( <p>Nenhum equipamento cadastrado para este ambiente.</p> )}
                </div>
                <hr />
                <div className={styles.solicitacoesSection}>
                    <h2>Solicitações de Reserva Pendentes</h2>
                    {solicitacoesReserva.length > 0 ? (
                        <ul className={styles.solicitacoesList}>
                            {solicitacoesReserva.map((reserva, index) => (
                                <li key={reserva.id} className={styles.solicitacaoItem}>
                                    <div className={styles.reservaInfo}>
                                        <strong>{reserva.titulo}</strong> por: {reserva.usuario_nome}<br/>
                                        <small>{new Date(reserva.data_inicio).toLocaleString()} até {new Date(reserva.data_fim).toLocaleString()}</small>
                                    </div>
                                    <div className={styles.actionButtons}>
                                        <button onClick={() => handleReservaAction('aprovar', reserva.id)} disabled={index !== 0} className={styles.approveButton}>Aprovar</button>
                                        <button onClick={() => handleReservaAction('rejeitar', reserva.id)} disabled={index !== 0} className={styles.rejectButton}>Rejeitar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (<p>Nenhuma solicitação de reserva pendente para este ambiente.</p>)}
                </div>
                <hr />
                <div className={styles.agendaSection}>
                    <h2>Agenda de Reservas</h2>
                    <AgendaAmbiente ambienteId={id} key={refreshKey} />
                </div>
            </div>
            {isAdicionarEquipamentoOpen && (<AdicionarEquipamentoModal ambienteId={id} onClose={() => setAdicionarEquipamentoOpen(false)} onSuccess={handleEquipamentoAdicionado}/>)}
            {isEditEquipamentoOpen && (<EditarEquipamentoModal equipamento={equipamentoParaEditar} onClose={() => setEditEquipamentoOpen(false)} onSuccess={handleEquipamentoAtualizado} onDelete={handleEquipamentoDeletado} />)}
            {isEditAmbienteOpen && (<EditarAmbienteModal ambiente={ambiente} onClose={() => setEditAmbienteOpen(false)} onSuccess={handleAmbienteAtualizado} />)}
            {isReservarOpen && (<ReservarModal ambiente={ambiente} onClose={() => setReservarOpen(false)} onSuccess={handleReservaSuccess} />)}
        </>
    );
};

export default AmbienteDetalhesPage;