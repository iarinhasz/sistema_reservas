import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Para os botões de navegação
//import './HomePage.css'; // Arquivo de estilos que vamos criar
import { useAuth } from '../../context/AuthContext';
import styles from '../public/HomePage.module.css';
import { useNavigate } from 'react-router-dom';
import AmbientesList from '../../components/shared/AmbientesList.jsx';

function HomePage() {
    // Estados para armazenar os dados, o status de carregamento e possíveis erros
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // useEffect para buscar os dados da API
    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                
                const response = await axios.get('http://localhost:3000/api/ambientes');
                setAmbientes(response.data); // Armazena os dados no estado
            } catch (err) {
                setError('Não foi possível carregar os ambientes. Tente novamente mais tarde.');
                console.error(err);
            } finally {
                setLoading(false); // Finaliza o estado de carregamento
            }
        };

        fetchAmbientes();
    }, []);

    const handleAmbienteClick = (ambienteId) => {
        if (!user) {
            // Se não estiver logado, vai para a página pública de detalhes
            navigate(`/ambientes/${ambienteId}`);
        } else if (user.tipo === 'admin') {
            // Se for admin, vai para a página de admin
            navigate(`/admin/ambientes/${ambienteId}`);
        } else {
            // Se for aluno ou professor, também vai para a página pública
            navigate(`/ambientes/${ambienteId}`);
        }
    };

    // Função para agrupar os ambientes por tipo
    const ambientesAgrupados = ambientes.reduce((acc, ambiente) => {
        const tipo = ambiente.tipo || 'Outros'; // Agrupa ambientes sem tipo em 'Outros'
        if (!acc[tipo]) {
            acc[tipo] = []; 
        }
        acc[tipo].push(ambiente);
        return acc;
    }, {});

    if (loading) return <p className="loading-message">Carregando ambientes...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className={styles.homeContainer}>
            <div className={styles.ambientesGrid}>
                {Object.entries(ambientesAgrupados).map(([tipo, listaDeAmbientes]) => (
                    <section key={tipo} className={styles.ambienteColuna}>
                        <h2>{tipo}s</h2>
                        <div className={styles.botoesContainer}>
                            {listaDeAmbientes.map(ambiente => (
                                <button 
                                    key={ambiente.id} 
                                    className={styles.ambienteBotao}
                                    onClick={() => handleAmbienteClick(ambiente.id)}
                                >
                                    {ambiente.identificacao}                                
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default HomePage;