import React from 'react';
import styles from './ReviewList.module.css';

const StarRating = ({ rating }) => (
    <div className={styles.starRating}>
        {[...Array(5)].map((_, index) => (
            <span key={index} className={index < rating ? styles.starFilled : styles.starEmpty}>
                ★
            </span>
        ))}
    </div>
);

const ReviewList = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
        return <p>Este ambiente ainda não possui avaliações.</p>;
    }

    return (
        <div className={styles.reviewsGrid}>
            {reviews.map(review => (
                <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.userName}>{review.usuario_nome}</span>
                        <StarRating rating={review.nota} />
                    </div>
                    <p className={styles.comment}>"{review.comentario}"</p>
                    <div className={styles.cardFooter}>
                        <small>{new Date(review.data_fim).toLocaleDateString()}</small>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;