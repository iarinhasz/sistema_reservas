import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './PublicAmbienteDetalhesPage.module.css';
import AgendaAmbiente from '../../components/shared/AgendaAmbiente'; // Importe o novo componente
import { useAuth} from '../../context/AuthContext';
const PublicAmbienteDetalhesPage = () => {
    const { id } = useParams();
    const [ambiente, setAmbiente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {user} = useAuth();

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

    const renderActionButtons = () => {
        if (!user) {
            // Se não estiver logado, não mostra botões de ação
            return null;
        }

        return (
            <div className={styles.actions}>
                <Link to={`/${user.tipo}/minhas-reservas`} className={styles.actionButton}>
                    Minhas Reservas
                </Link>

                {/* Botão de Fazer Reserva muda conforme o tipo de usuário */}
                {user.tipo === 'professor' && (
                    <Link to={`/professor/reservar/${id}`} className={styles.actionButton}>
                        Reservar Ambiente
                    </Link>
                )}

                {user.tipo === 'aluno' && (
                    <Link to={`/aluno/reservar-equipamento/${id}`} className={styles.actionButton}>
                        Reservar Equipamento
                    </Link>
                )}
                
                <Link to={`/review/ambiente/${id}`} className={styles.actionButton}>
                    Fazer Review
                </Link>
            </div>
        );
    };

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
<<<<<<< HEAD
            
=======
            {renderActionButtons()}

>>>>>>> tailwind-front-admin
            <AgendaAmbiente ambienteId={id} />
        </div>
    );
};

export default PublicAmbienteDetalhesPage;