import axios from 'axios';
import { useEffect, useState } from 'react';
import styles from './css/solicitacoesCadastroPage.module.css';

const SolicitacoesCadastroPage = () => {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados para controlar o modal de rejeição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserCpf, setCurrentUserCpf] = useState(null);
    const [justificativa, setJustificativa] = useState('');

    useEffect(() => {
        const checkForPendingRequests = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get('http://localhost:3000/api/usuarios/pendentes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.data.usuarios && response.data.usuarios.length > 0) {
                    setHasPendingRequests(true);
                }
            } catch (error) {
                console.error("Erro ao verificar solicitações pendentes:", error);
            }
        };

        checkForPendingRequests();
    }, []);

    const handleApprove = async (cpf) => {
        await handleAction('aprovar', cpf);
    };

    const handleReject = async () => {
        if (!justificativa) {
            alert('Por favor, informe o motivo da rejeição.');
            return;
        }
        await handleAction('rejeitar', currentUserCpf, { justificativa });
        closeModal();
    };

    const handleAction = async (action, cpf, body = {}) => {
        // ... (sua função handleAction, agora um pouco mais genérica)
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

    const openModal = (cpf) => {
        setCurrentUserCpf(cpf);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentUserCpf(null);
        setJustificativa('');
    };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <div className={styles.pageContainer}>
            <h1>Solicitações de Cadastro Pendentes</h1>
            {solicitacoes.length === 0 ? (
                <p>Nenhuma solicitação pendente no momento.</p>
            ) : (
                <ul className={styles.solicitacoesList}>
                    {solicitacoes.map((solicitacao, index) => (
                        <li key={solicitacao.cpf} className={styles.solicitacaoItem}>
                            {/* ... (a div userInfo continua a mesma) ... */}
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
                                    onClick={() => openModal(solicitacao.cpf)} // MUDANÇA AQUI
                                    disabled={index !== 0}
                                >
                                    Rejeitar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal de Rejeição */}
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
                            <button onClick={handleReject} className={styles.confirmButton}>Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitacoesCadastroPage;