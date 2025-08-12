import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ReviewList from '../../components/shared/ReviewList.jsx';
import Button from '../../components/shared/Button';
import styles from '../../components/layout/UserLayout.module.css'; // Usando o estilo correto do layout

const AvaliacoesPorAmbientePage = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState([]);
    const [ambiente, setAmbiente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const [ambienteRes, reviewsRes] = await Promise.all([
                    api.get(`/ambientes/${id}`),
                    api.get(`/reservas/ambiente/${id}/reviews-completos`)
                ]);
                setAmbiente(ambienteRes.data);
                setReviews(reviewsRes.data.data || []);
                setError('');
            } catch (err) {
                setError('Não foi possível carregar as avaliações.');
                console.error("Erro ao buscar avaliações:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [id]);

    if (loading) return <p>Carregando avaliações...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Avaliações de: {ambiente?.identificacao}</h1>
                <Button as={Link} to={`/admin/ambientes/${id}`} variant="cancel">
                    Voltar ao Ambiente
                </Button>
            </div>
            <div className={styles.card}>
                <ReviewList reviews={reviews} />
            </div>
        </>
    );
};

export default AvaliacoesPorAmbientePage;
