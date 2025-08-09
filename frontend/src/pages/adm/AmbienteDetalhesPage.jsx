import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdicionarEquipamentoModal from '../../components/adm/adicionarEquipamentoModal.jsx';
import EditarAmbienteModal from '../../components/adm/editarAmbienteModal.jsx';
import EditarEquipamentoModal from '../../components/adm/editarEquipamentoModal.jsx';
import ReservarModal from '../../components/adm/ReservarModal.jsx';
import api from '../../services/api';
//import styles from './css/AmbienteDetalhesPage.module.css';
import { EditIcon } from '../../components/icons/index';
import { useAuth } from '../../context/AuthContext';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente.jsx';

//estilos refatorados
import layout from '../../styles/Layout.module.css';
import table from '../../styles/Table.module.css';
import list from '../../styles/List.module.css';
import Button from '../../components/shared/Button.jsx'; 

const AmbienteDetalhesPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
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
    
    const handleAmbienteDeletado = () => {
        alert('Ambiente deletado com sucesso!');
        navigate(`/ambientes/${id}`);
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
            <div className={layout.container}>
                <div className={layout.pageHeader}>
                    <h1>{ambiente.identificacao}</h1>
                    <div className={layout.pageHeaderActions}>
                        <Button variant="primary" onClick={() => setEditAmbienteOpen(true)}><EditIcon /> Editar Ambiente</Button>
                        <Button variant="primary" onClick={() => setReservarOpen(true)}>Fazer Reserva</Button>
                    </div>
                </div>

                <div className={layout.detailsGrid}>
                    <p><strong>ID:</strong></p> <p>{ambiente.id}</p>
                    <p><strong>Tipo:</strong></p> <p>{ambiente.tipo}</p>
                    <p><strong>Status:</strong></p> <p>{ambiente.status}</p>
                </div>
                <hr />
                <div className={layout.section}>
                    <div className={layout.sectionHeader}>
                        <h2>Equipamentos</h2>
                        <Button variant="primary" onClick={() => setAdicionarEquipamentoOpen(true)}>+ Inserir Equipamento</Button>
                    </div>
                    {equipamentos.length > 0 ? (
                    <table className={table.table}>
                        <thead><tr><th>Nome</th><th>Marca</th><th>Modelo</th><th>Ações</th></tr></thead>
                        <tbody>
                            {equipamentos.map(eq => (
                                <tr key={eq.id}>
                                    <td>{eq.nome}</td><td>{eq.marca || 'N/A'}</td><td>{eq.modelo || 'N/A'}</td>
                                    <td><Button variant="primary" onClick={() => handleOpenEditModal(eq)}><EditIcon/></Button></td>
                                </tr>
                            ))}
                        </tbody>                        
                    </table>) : ( <p>Nenhum equipamento cadastrado para este ambiente.</p> )}
                </div>
                <hr />
                <div className={layout.section}>
                    <div className={layout.sectionHeader}>
                        <h2>Solicitações Pendentes</h2>
                    </div>
                    {solicitacoesReserva.length > 0 ? (
                        <ul className={list.list}>
                            {solicitacoesReserva.map((reserva, index) => (
                                <li key={reserva.id} className={`${list.listItem} ${list['listItem--pending']}`}>
                                    <div className={list.listItemInfo}>
                                        <strong>{reserva.titulo}</strong>
                                        <small> por: {reserva.usuario_nome}</small>
                                    </div>
                                    <div className={list.listItemActions}>
                                        <Button variant="secondary" onClick={() => handleReservaAction('aprovar', reserva.id)} disabled={index !== 0}>Aprovar</Button>
                                        <Button variant="danger" onClick={() => handleReservaAction('rejeitar', reserva.id)} disabled={index !== 0}>Rejeitar</Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (<p>Nenhuma solicitação pendente.</p>)}
                </div>
                <hr />
                <div className={layout.section}>
                    <div className={layout.sectionHeader}><h2>Agenda de Reservas</h2></div>
                    <AgendaAmbiente ambienteId={id} key={refreshKey} userRole={user?.tipo} />
                </div>
            </div>
            {isAdicionarEquipamentoOpen && (<AdicionarEquipamentoModal ambienteId={id} onClose={() => setAdicionarEquipamentoOpen(false)} onSuccess={handleEquipamentoAdicionado}/>)}
            {isEditEquipamentoOpen && (<EditarEquipamentoModal equipamento={equipamentoParaEditar} onClose={() => setEditEquipamentoOpen(false)} onSuccess={handleEquipamentoAtualizado} onDelete={handleEquipamentoDeletado} />)}
            {isEditAmbienteOpen && (<EditarAmbienteModal ambiente={ambiente} onClose={() => setEditAmbienteOpen(false)} onSuccess={handleAmbienteAtualizado} onDelete={handleAmbienteDeletado}/>)}
            {isReservarOpen && (<ReservarModal ambiente={ambiente} onClose={() => setReservarOpen(false)} onSuccess={handleReservaSuccess} />)}
        </>
    );
};

export default AmbienteDetalhesPage;