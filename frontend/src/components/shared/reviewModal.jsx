import { useState } from 'react';
import styles from '../../styles/modal.module.css';
import Button from './Button';
import StarRating from './StarRating';


const ReviewModal = ({ reserva, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    if (!reserva) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
            return;
        }
        onSubmit({
            nota: rating,
            comentario: comment,
            reservaId: reserva.id
        });
    };
    
    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Avaliar Reserva</h2>
                    <button className={styles.closeButton} onClick={onClose}>&times;</button>
                </div>
                
                <p>Recurso: <strong>{reserva.recurso_nome || reserva.titulo}</strong></p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Sua avaliação:</label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="comment">Comentário (opcional):</label>
                        <textarea
                            id="comment"
                            className={styles.textarea}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows="4"
                            placeholder="Descreva sua experiência..."
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    
                    <div className={styles.modalActions}>
                        <Button type="button" variant="cancel" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary">
                            Enviar Avaliação
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;