import { useEffect, useState } from 'react';
import api from '../../services/api';

import styles from '../css/AmbientesList.module.css'; //

const AmbientesList = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const response = await api.get('/ambientes');
                setAmbientes(response.data);
            } catch (err) {
                setError('Não foi possível carregar os ambientes.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbientes();
    }, []);

    const ambientesAgrupados = ambientes.reduce((acc, ambiente) => {
        const tipo = ambiente.tipo || 'Outros';
        if (!acc[tipo]) {
            acc[tipo] = [];
        }
        acc[tipo].push(ambiente);
        return acc;
    }, {});

    if (loading) return <p className={styles.message}>Carregando ambientes...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <main className={styles.ambientesGrid}>
            {Object.entries(ambientesAgrupados).map(([tipo, listaDeAmbientes]) => (
                <section key={tipo} className={styles.ambienteColuna}>
                    <h2>{tipo}</h2>
                    <div className={styles.botoesContainer}>
                        {listaDeAmbientes.map(ambiente => (
                            <button key={ambiente.id} className={styles.ambienteBotao}>
                                {ambiente.identificacao}
                            </button>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
};

export default AmbientesList;