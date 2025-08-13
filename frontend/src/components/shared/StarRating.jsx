import React from 'react';
import styles from './StarRating.module.css';
import { useEffect, useState } from 'react';

const StarRating = ({ rating, setRating }) => {
    //efeito do mouse
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map(starIndex => {
                const isOn = (hoverRating || rating) >= starIndex;
                
                return (
                    <span
                        key={starIndex}
                        className={isOn ? styles.on : styles.off}
                        // Define a avaliação ao clicar
                        onClick={() => setRating(starIndex)}
                        // Atualiza o estado de hover ao passar o mouse
                        onMouseOver={() => setHoverRating(starIndex)}
                        // Limpa o estado de hover ao retirar o mouse
                        onMouseOut={() => setHoverRating(0)}
                    >
                        &#9733; {/* Símbolo de estrela */}
                    </span>
                );
            })}
        </div>
    );
};

export default StarRating;