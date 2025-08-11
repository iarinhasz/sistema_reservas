import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './css/GerenciarUsuariosPage.module.css';
import tableStyles from '../../styles/Table.module.css';
import { useDebounce } from '../../hooks/useDebounce';

const GerenciarUsuariosPage = () => {
    // Estados para a fila de aprovação
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);
    
    // Estados para a lista de usuários gerenciáveis
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    
    // Estado para os filtros de busca
    const [filters, setFilters] = useState({ nome: '', cpf: '', tipo: 'todos' });
    const debouncedFilters = useDebounce(filters, 500);

    // Estados para feedback (modal de rejeição e mensagens de sucesso/erro)
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserCpf, setCurrentUserCpf] = useState(null);
    const [justificativa, setJustificativa] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [adminPassword, setAdminPassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Busca as solicitações pendentes (apenas uma vez, ao carregar a página)
    const fetchSolicitacoes = async () => {
        setLoadingSolicitacoes(true);
        try {
            const response = await api.get('/usuarios/pendentes');
            setSolicitacoes(response.data.usuarios || []);
        } catch (err) {
            setError('Erro ao carregar solicitações pendentes.');
            console.error(err);
        } finally {
            setLoadingSolicitacoes(false);
        }
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    // Busca os usuários gerenciáveis sempre que os filtros mudam
    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoadingUsuarios(true);
            try {
                const params = new URLSearchParams();
                if (debouncedFilters.nome) params.append('nome', debouncedFilters.nome);
                if (debouncedFilters.cpf) params.append('cpf', debouncedFilters.cpf);
                if (debouncedFilters.tipo !== 'todos') params.append('tipo', debouncedFilters.tipo);

                const response = await api.get(`/usuarios?${params.toString()}`);
                setUsuarios(response.data || []);
            } catch (err) {
                setError('Erro ao buscar usuários.');
                console.error(err);
            } finally {
                setLoadingUsuarios(false);
            }
        };
        fetchUsuarios();
    }, [debouncedFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    // --- FUNÇÕES DE AÇÃO PARA A FILA (AGORA COMPLETAS) ---
    const handleAction = async (action, cpf, body = {}) => {
        try {
            await api.post(`/usuarios/${cpf}/${action}`, body);
            // Remove da lista de solicitações
            setSolicitacoes(prev => prev.filter(s => s.cpf !== cpf));
        } catch (err) {
            setError(`Erro ao ${action}r solicitação.`);
            console.error(err);
        }
    };

    const handleApprove = async (cpf) => {
        await handleAction('aprovar', cpf);
        setSuccessMessage('Usuário aprovado com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000); // Mensagem some após 3 segundos
    };

    const handleConfirmReject = async () => {
        if (!justificativa) {
            alert('Por favor, informe o motivo da rejeição.');
            return;
        }
        await handleAction('rejeitar', currentUserCpf, { justificativa });
        closeModal();
    };

    const openModal = (cpf) => {
        setCurrentUserCpf(cpf);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUserCpf(null);
        setJustificativa('');
    };

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
        setAdminPassword('');
        setDeleteError('');
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        setDeleteError('');

        try {
            await api.delete(`/usuarios/${userToDelete.cpf}`, {
                data: { password: adminPassword }
            });
            
            setUsuarios(prev => prev.filter(u => u.cpf !== userToDelete.cpf));
            closeDeleteModal();

        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Erro ao deletar usuário.');
        } finally {
            setLoadingUsuarios(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <h1>Gerenciar Usuários</h1>
            {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <section className={styles.section}>
                <h2>Solicitações de Cadastro Pendentes</h2>
                {loadingSolicitacoes ? <p>Carregando...</p> : solicitacoes.length === 0 ? (
                    <p>Nenhuma solicitação pendente no momento.</p>
                ) : (
                    <ul className={styles.solicitacoesList}>
                        {solicitacoes.map((solicitacao, index) => (
                           <li key={solicitacao.cpf} className={styles.solicitacaoItem}>
                               <div className={styles.userInfo}>
                                    <strong>Nome:</strong> {solicitacao.nome}<br />
                                    <strong>Email:</strong> {solicitacao.email} ({solicitacao.tipo})
                                </div>
                                <div className={styles.actionButtons}>
                                    <button className={styles.approveButton} onClick={() => handleApprove(solicitacao.cpf)} disabled={index !== 0}>Aprovar</button>
                                    <button className={styles.rejectButton} onClick={() => openModal(solicitacao.cpf)} disabled={index !== 0}>Rejeitar</button>
                                </div>
                           </li>
                        ))}
                    </ul>
                )}
            </section>
            
            <hr className={styles.divider} />

            <section className={styles.section}>
                <h2>Buscar e Gerenciar Usuários</h2>
                <div className={styles.filters}>
                    <input type="text" name="nome" placeholder="Buscar por nome..." value={filters.nome} onChange={handleFilterChange} />
                    <input type="text" name="cpf" placeholder="Buscar por CPF..." value={filters.cpf} onChange={handleFilterChange} />
                    <div className={styles.radioGroup}>
                        <span>Tipo:</span>
                        <label><input type="radio" name="tipo" value="todos" checked={filters.tipo === 'todos'} onChange={handleFilterChange} /> Todos</label>
                        <label><input type="radio" name="tipo" value="aluno" checked={filters.tipo === 'aluno'} onChange={handleFilterChange} /> Aluno</label>
                        <label><input type="radio" name="tipo" value="professor" checked={filters.tipo === 'professor'} onChange={handleFilterChange} /> Professor</label>
                    </div>
                </div>
                <div className={styles.tableContainer}>
                    <table className={tableStyles.table}>
                        <thead><tr><th>Nome</th><th>CPF</th><th>Email</th><th>Tipo</th><th>Status</th><th>Ações</th></tr></thead>
                        <tbody>
                            {loadingUsuarios ? (
                                <tr><td colSpan="6">Buscando...</td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan="6">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                usuarios.map(user => (
                                    <tr key={user.cpf}>
                                        <td>{user.nome}</td><td>{user.cpf}</td><td>{user.email}</td><td>{user.tipo}</td>
                                        <td><span className={`${styles.status} ${styles[user.status]}`}>{user.status}</span></td>
                                        <td><button onClick={() => openDeleteModal(user)} className={styles.deleteActionBtn}>Deletar</button></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Motivo da Rejeição</h2>
                        <textarea className={styles.justificativaTextarea} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Descreva o motivo..."/>
                        <div className={styles.modalActions}>
                            <button onClick={closeModal} className={styles.cancelButton}>Cancelar</button>
                            <button onClick={handleConfirmReject} className={styles.confirmButton}>Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteModalOpen && userToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Confirmar Exclusão</h2>
                        <p>
                            Você tem certeza que deseja excluir o usuário <strong>{userToDelete.nome}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className={styles.formGroup}>
                            <label htmlFor="adminPassword">Para confirmar, digite sua senha de administrador:</label>
                            <input
                                type="password"
                                id="adminPassword"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                placeholder="Sua senha"
                            />
                        </div>
                        {deleteError && <p className={styles.errorMessage}>{deleteError}</p>}
                        <div className={styles.modalActions}>
                            <button onClick={closeDeleteModal} className={styles.cancelButton}>Cancelar</button>
                            <button onClick={handleConfirmDelete} className={styles.confirmDeleteButton} disabled={isDeleting}>
                                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Usuário'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GerenciarUsuariosPage;