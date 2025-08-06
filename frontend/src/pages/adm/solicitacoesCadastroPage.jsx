import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './css/solicitacoesCadastroPage.module.css';

const SolicitacoesCadastroPage = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserCpf, setCurrentUserCpf] = useState(null);
    const [justificativa, setJustificativa] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
        const fetchSolicitacoes = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/api/usuarios/pendentes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setSolicitacoes(response.data.usuarios || []);
            } catch (err) {
                setError('Erro ao carregar solicitações.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSolicitacoes();
    }, []);

    const handleAction = async (action, cpf, body = {}) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:3000/api/usuarios/${cpf}/${action}`, body, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSolicitacoes(prev => prev.filter(s => s.cpf !== cpf));
        } catch (err) {
            setError(`Erro ao ${action}r solicitação.`);
            console.error(err);
        }
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

    if (loading) return <div className={styles.pageContainer}><p>Carregando...</p></div>;
    if (error) return <div className={styles.pageContainer}><p className={styles.errorMessage}>{error}</p></div>;

    return (
        <div className={styles.pageContainer}>
            <h1>Solicitações de Cadastro Pendentes</h1>
            
            {successMessage && (
                <div className={styles.successMessage}>
                    {successMessage}
                </div>
            )}
            {solicitacoes.length === 0 ? (
                <p>Nenhuma solicitação pendente no momento.</p>
            ) : (
                <ul className={styles.solicitacoesList}>
                    {solicitacoes.map((solicitacao, index) => (
                        <li key={solicitacao.cpf} className={styles.solicitacaoItem}>
                            <div className={styles.userInfo}>
                                <strong>Nome:</strong> {solicitacao.nome}<br />
                                <strong>Email:</strong> {solicitacao.email}<br />
                                <strong>CPF:</strong> {solicitacao.cpf}<br />
                                <strong>Tipo:</strong> {solicitacao.tipo}
                            </div>
                            <div className={styles.actionButtons}>
                                <button 
                                    className={styles.approveButton}
                                    onClick={() => handleApprove(solicitacao.cpf)}
                                    disabled={index !== 0}
                                >
                                    Aprovar
                                </button>
                                <button 
                                    className={styles.rejectButton}
                                    onClick={() => openModal(solicitacao.cpf)}
                                    disabled={index !== 0}
                                >
                                    Rejeitar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Motivo da Rejeição</h2>
                        <textarea
                            className={styles.justificativaTextarea}
                            value={justificativa}
                            onChange={(e) => setJustificativa(e.target.value)}
                            placeholder="Descreva o motivo para rejeitar este cadastro..."
                        />
                        <div className={styles.modalActions}>
                            <button onClick={closeModal} className={styles.cancelButton}>Cancelar</button>
                            <button onClick={handleConfirmReject} className={styles.confirmButton}>Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitacoesCadastroPage;