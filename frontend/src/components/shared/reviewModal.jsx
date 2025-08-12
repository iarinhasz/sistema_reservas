import React, { useState } from 'react';
import styles from '../css/reviewModal.module.css';
import Button from './Button';

const ReviewModal = ({ reserva, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!reserva) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
            return;
        }
        onSubmit({
            rating,
            comment,
            reservaId: reserva.id
        });
    };
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                <h2>Avaliar Reserva</h2>
                <p>Recurso: <strong>{reserva.recurso_nome || reserva.titulo}</strong></p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.starRating}>
                        <label>Sua avaliação:</label>
                        <div className={styles.stars}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={rating >= star ? styles.on : styles.off}
                                    onClick={() => setRating(star)}
                                >
                                    &#9733;
                                </span>
                            ))}
                        </div>
                    </div>
                    
                    <div className={styles.commentSection}>
                        <label htmlFor="comment">Comentário (opcional):</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            placeholder="Descreva sua experiência..."
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="primary">Enviar Avaliação</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
