import React from 'react';
import styles from './ReservaDetalhesModal.module.css';

const ReservaDetalhesModal = ({ reserva, onClose }) => {
    if (!reserva) return null;

    const { titulo, usuario_nome, status, nota, comentario } = reserva;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detalhes da Reserva</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <div className={styles.details}>
                    <p><strong>Título:</strong> {titulo}</p>
                    <p><strong>Solicitante:</strong> {usuario_nome}</p>
                    <p><strong>Status:</strong> <span className={`${styles.status} ${styles[status]}`}>{status}</span></p>
                    <hr className={styles.divider} />
                    <h4>Avaliação</h4>
                    {nota ? (
                        <div>
                            <p><strong>Nota:</strong> {nota}/5</p>
                            <p><strong>Comentário:</strong> {comentario}</p>
                        </div>
                    ) : (<p>Esta reserva ainda não foi avaliada.</p>)}
                </div>
            </div>
        </div>
    );
};

export default ReservaDetalhesModal;