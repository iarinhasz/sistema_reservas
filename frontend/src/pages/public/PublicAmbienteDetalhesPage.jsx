import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './PublicAmbienteDetalhesPage.module.css';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente'; // Importe o novo componente

const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const [ambiente, setAmbiente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAmbiente = async () => {
            setLoading(true);
            try {
                // Agora busca apenas os dados do ambiente
                const response = await axios.get(`http://localhost:3000/api/ambientes/${id}`);
                setAmbiente(response.data);
            } catch (err) {
                setError('Falha ao carregar dados do ambiente.');
            } finally {
                setLoading(false);
            }
        };
        fetchAmbiente();
    }, [id]);
    
    if (loading) return <p className={styles.message}>Carregando...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!ambiente) return <p className={styles.message}>Ambiente não encontrado.</p>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>{ambiente.identificacao}</h1>
                    <p className={styles.subtitulo}>Agenda de Reservas</p>
                </div>
                <Link to="/" className={styles.backButton}>Voltar</Link>
            </header>
            
            {/* Renderiza o componente de agenda, passando o ID do ambiente */}
            <AgendaAmbiente ambienteId={id} />
        </div>
    );
};

export default PublicAmbienteDetalhesPage;