import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdicionarEquipamentoModal from '../../components/adm/adicionarEquipamentoModal.jsx';
import EditarAmbienteModal from '../../components/adm/editarAmbienteModal.jsx';
import EditarEquipamentoModal from '../../components/adm/editarEquipamentoModal.jsx';
import { AddIcon, EditIcon } from '../../components/icons/index';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente.jsx';
import Button from '../../components/shared/Button.jsx';
import EquipamentosList from '../../components/shared/EquipamentoList.jsx';
import ReservarModal from '../../components/shared/ReservarModal.jsx';
import { useAuth } from '../../context/AuthContext';
import { useNotificacao } from '../../hooks/useNotificacao.js';
import api from '../../services/api';
import list from '../../styles/List.module.css';
import styles from '../../components/layout/UserLayout.module.css';

const AmbienteDetalhesPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { limparAlertaReserva } = useNotificacao(); 
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
    const navigate = useNavigate(); 

    
    useEffect(() => {
        limparAlertaReserva(parseInt(id, 10));

        const fetchData = async () => {
            setLoading(true);
            try {
                // Chamada de API unificada para todas as solicitações pendentes
                const [ambienteRes, equipamentosRes, solicitacoesRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/equipamentos?ambienteId=${id}`),
                    api.get(`/reservas/pendentes/ambiente/${id}`), 
                ]);
                
                const ambienteData = ambienteRes.data;
                const equipamentosData = equipamentosRes.data || [];
                const solicitacoesData = solicitacoesRes.data.data || [];

                setAmbiente(ambienteData);
                // A lista de solicitações agora contém tanto as do ambiente quanto as dos equipamentos
                setSolicitacoesReserva(solicitacoesData);
                
                // Lógica para marcar equipamentos com pendências
                const equipamentosComPendencia = equipamentosData.map(eq => ({
                    ...eq,
                    temSolicitacaoPendente: solicitacoesData.some(sol => 
                        sol.recurso_tipo === 'equipamento' && sol.recurso_id === eq.id
                    )
                }));
                setEquipamentos(equipamentosComPendencia);

                setError('');
            } catch (err) {
                setError('Falha ao carregar dados. Verifique se o ambiente existe.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, refreshKey, limparAlertaReserva]);

    const handleReservaAction = async (action, reservaId) => {
        try {
            await api.put(`/reservas/${reservaId}/${action}`, {});
            setSolicitacoesReserva(prev => prev.filter(r => r.id !== reservaId));
            setRefreshKey(prevKey => prevKey + 1); 
        } catch (err) {
            alert(`Erro ao ${action}r reserva.`);
        }
    };
    
    const handleAmbienteDeletado = () => {
        alert('Ambiente deletado com sucesso!');
        navigate('/admin');
    };

    const handleReservaSuccess = () => { setRefreshKey(prevKey => prevKey + 1) };
    const handleEquipamentoAdicionado = () => { setRefreshKey(prevKey => prevKey + 1) };
    const handleOpenEditModal = (equipamento) => { setEquipamentoParaEditar(equipamento); setEditEquipamentoOpen(true) };
    const handleEquipamentoAtualizado = () => { setRefreshKey(prevKey => prevKey + 1) };
    const handleEquipamentoDeletado = () => { setRefreshKey(prevKey => prevKey + 1); setEditEquipamentoOpen(false) };
    const handleAmbienteAtualizado = (ambienteAtualizado) => { setAmbiente(ambienteAtualizado) };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!ambiente) return <p>Ambiente não encontrado.</p>;

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>{ambiente.identificacao}</h1>
                <div className={styles.pageHeaderActions}>
                    <Button variant="primary" onClick={() => setEditAmbienteOpen(true)}><EditIcon /> Editar Ambiente</Button>
                    <Button as={Link} to={`/admin/ambientes/${id}/avaliacoes`} variant="primary">
                        Ver Avaliações
                    </Button>
                    <Button variant="primary" onClick={() => setReservarOpen(true)}>Fazer Reserva</Button>
                </div>
            </div>

            <div className={`${styles.card} ${styles.cardCompact} ${styles.detailsGrid}`}>
                <p><strong>ID:</strong></p> <p>{ambiente.id}</p>
                <p><strong>Tipo:</strong></p> <p>{ambiente.tipo}</p>
                <p><strong>Status:</strong></p> <p>{ambiente.status}</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Equipamentos</h2>
                    <Button variant="secondary" onClick={() => setAdicionarEquipamentoOpen(true)} icon={AddIcon}>
                        Inserir Equipamento
                    </Button>
                </div>
                <div className={styles.card}>
                    <EquipamentosList 
                        equipamentos={equipamentos} 
                        ambienteId={id} 
                        userRole="admin" 
                        onEditEquipamento={handleOpenEditModal} 
                    />
                </div>
            </div>
            
            {solicitacoesReserva.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Solicitações Pendentes</h2>
                    </div>
                    <div className={styles.card}>
                        <ul className={list.list}>
                            {solicitacoesReserva.map((reserva, index) => (
                                <li key={reserva.id} className={`${list.listItem} ${list['listItem--pending']}`}>
                                    <div className={list.listItemInfo}>
                                        {/* Adiciona o tipo de recurso (ambiente ou equipamento) */}
                                        <span className={list.recursoTipo}>
                                            Reserva de {reserva.recurso_tipo}
                                        </span>
                                        {/* Título da reserva */}
                                        <span className={list.reservaTitulo}>
                                            {reserva.titulo}
                                        </span>
                                        {/* Nome do solicitante */}
                                        <span className={list.solicitanteNome}>
                                            por: {reserva.usuario_nome}
                                        </span>
                                    </div>
                                    <div className={list.listItemActions}>
                                        <Button variant="secondary" onClick={() => handleReservaAction('aprovar', reserva.id)}>Aprovar</Button>
                                        <Button variant="danger" onClick={() => handleReservaAction('rejeitar', reserva.id)}>Rejeitar</Button>
                                    </div>
                                </li>

                            ))}
                        </ul>
                    </div>
                </div>
            )}
            
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Agenda de Reservas</h2>
                </div>
                <div className={styles.card}>
                    <AgendaAmbiente ambienteId={id} key={refreshKey} userRole={user?.tipo} />
                </div>
            </div>
            
            {isAdicionarEquipamentoOpen && (<AdicionarEquipamentoModal ambienteId={id} onClose={() => setAdicionarEquipamentoOpen(false)} onSuccess={handleEquipamentoAdicionado}/>)}
            {isEditEquipamentoOpen && (<EditarEquipamentoModal equipamento={equipamentoParaEditar} onClose={() => setEditEquipamentoOpen(false)} onSuccess={handleEquipamentoAtualizado} onDelete={handleEquipamentoDeletado} />)}
            {isEditAmbienteOpen && (<EditarAmbienteModal ambiente={ambiente} onClose={() => setEditAmbienteOpen(false)} onSuccess={handleAmbienteAtualizado} onDelete={handleAmbienteDeletado}/>)}
            {isReservarOpen && (
                <ReservarModal 
                    recurso={{...ambiente, recurso_tipo: 'ambiente'}}
                    onClose={() => setReservarOpen(false)} 
                    onSuccess={handleReservaSuccess} 
                />
            )}
        </>
    );
};

export default AmbienteDetalhesPage;
