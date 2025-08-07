import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import styles from './css/GerenciarUsuariosPage.module.css'; // Usaremos um novo CSS
import { useDebounce } from '../../hooks/useDebounce'; // Um hook para otimizar a busca

const GerenciarUsuariosPage = () => {
    // Estados para a fila de aprovação
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true);
    
    // Estados para a lista de usuários gerenciáveis
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    
    // Estado para os filtros de busca
    const [filters, setFilters] = useState({ nome: '', cpf: '', tipo: 'todos' });
    const debouncedFilters = useDebounce(filters, 500); // Otimização: espera 500ms após o usuário parar de digitar

    // Estados para feedback (modais, mensagens, etc.)
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // ... (outros estados do modal de rejeição)

    // Busca as solicitações pendentes ao carregar a página
    useEffect(() => {
        const fetchSolicitacoes = async () => {
            setLoadingSolicitacoes(true);
            try {
                const response = await api.get('/usuarios/pendentes');
                setSolicitacoes(response.data.usuarios || []);
            } catch (err) {
                setError('Erro ao carregar solicitações pendentes.');
            } finally {
                setLoadingSolicitacoes(false);
            }
        };
        fetchSolicitacoes();
    }, []);

    // Busca os usuários gerenciáveis sempre que os filtros (debounced) mudam
    useEffect(() => {
        const fetchUsuarios = async () => {
            setLoadingUsuarios(true);
            try {
                // Monta os parâmetros de busca
                const params = new URLSearchParams();
                if (debouncedFilters.nome) params.append('nome', debouncedFilters.nome);
                if (debouncedFilters.cpf) params.append('cpf', debouncedFilters.cpf);
                if (debouncedFilters.tipo !== 'todos') params.append('tipo', debouncedFilters.tipo);

                const response = await api.get(`/usuarios?${params.toString()}`);
                setUsuarios(response.data || []);
            } catch (err) {
                setError('Erro ao buscar usuários.');
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

    const handleApprove = async (cpf) => {
        try {
            await handleAction('aprovar', cpf);
            setSuccessMessage('Usuário aprovado com sucesso!');
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        } catch (err) {
            console.error(err);
        }
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

    return (
        <div className={styles.pageContainer}>
            <h1>Gerenciar Usuários</h1>

            {/* Seção de Aprovações Pendentes */}
            <section className={styles.section}>
                <h2>Solicitações de Cadastro Pendentes</h2>
                {loadingSolicitacoes ? <p>Carregando...</p> : solicitacoes.length === 0 ? (
                    <p>Nenhuma solicitação pendente no momento.</p>
                ) : (
                    <ul className={styles.solicitacoesList}>
                        {solicitacoes.map((solicitacao, index) => (
                           <li key={solicitacao.cpf} className={styles.solicitacaoItem}>
                               {/* ... (lógica da fila de aprovação que você já tem) ... */}
                           </li>
                        ))}
                    </ul>
                )}
            </section>
            
            <hr className={styles.divider} />

            {/* Seção de Gerenciamento de Usuários */}
            <section className={styles.section}>
                <h2>Buscar e Gerenciar Usuários Ativos</h2>
                
                {/* Filtros de Busca */}
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

                {/* Tabela de Resultados */}
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Email</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingUsuarios ? (
                                <tr><td colSpan="6">Buscando...</td></tr>
                            ) : usuarios.length === 0 ? (
                                <tr><td colSpan="6">Nenhum usuário encontrado.</td></tr>
                            ) : (
                                usuarios.map(user => (
                                    <tr key={user.cpf}>
                                        <td>{user.nome}</td>
                                        <td>{user.cpf}</td>
                                        <td>{user.email}</td>
                                        <td>{user.tipo}</td>
                                        <td><span className={`${styles.status} ${styles[user.status]}`}>{user.status}</span></td>
                                        <td><button>Editar</button></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default GerenciarUsuariosPage;