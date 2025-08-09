import React, { useState, useEffect } from 'react';
import api from '../../services/api';

import layout from '../../styles/Layout.module.css';
import styles from './css/visualizarReview.module.css';

const StarRating = ({ rating }) => {
    return (
        <div className={styles.starRating}>
            {[...Array(5)].map((_, index) => (
                <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
                    ★
                </span>
            ))}
        </div>
    );
};

const VisualizarReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                // Chamada para a nova rota do backend
                const response = await api.get('reservas/review-all');
                setReviews(response.data.data || []); // Assumindo que os dados vêm em response.data.data
            } catch (err) {
                setError('Não foi possível carregar os reviews.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) return <p>Carregando reviews...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className={layout.container}>
            <div className={layout.pageHeader}>
                <h1>Avaliações dos Usuários</h1>
            </div>

            {reviews.length === 0 ? (
                <p>Nenhum review encontrado.</p>
            ) : (
                <div className={styles.reviewsGrid}>
                    {reviews.map(review => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.recursoNome}>{review.recurso_nome}</span>
                                <StarRating rating={review.nota} />
                            </div>
                            <p className={styles.comentario}>"{review.comentario}"</p>
                            <div className={styles.cardFooter}>
                                <span>- {review.usuario_nome}</span>
                                <small>{new Date(review.data_fim).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VisualizarReviewsPage;