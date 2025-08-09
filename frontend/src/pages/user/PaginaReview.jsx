
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from '../user/css/PaginaReview.module.css';

const PaginaReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State para guardar informações do ambiente que está sendo avaliado
    const [recurso, setRecurso] = useState(null);
    const [loading, setLoading] = useState(true);

    // State para o formulário de review
    const [nota, setNota] = useState(0);
    const [comentario, setComentario] = useState('');

    // useEffect para buscar os dados do ambiente/recurso quando a página carregar
    useEffect(() => {
        const fetchRecurso = async () => {
            try {
                // const response = await api.get(`/ambientes/${id}`);
                // setRecurso(response.data);

                // Por enquanto, vamos simular os dados:
                console.log(`Buscando dados para o recurso com ID: ${id}`);
                setRecurso({ identificacao: `Recurso ${id}` });

            } catch (error) {
                console.error("Erro ao buscar dados do recurso:", error);
                // Opcional: redirecionar para a home se o recurso não for encontrado
                // navigate('/'); 
            } finally {
                setLoading(false);
            }
        };

        fetchRecurso();
    }, [id]); // A dependência [id] faz isso rodar sempre que o ID na URL mudar

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (nota === 0) {
            alert('Por favor, selecione uma nota de 1 a 5.');
            return;
        }
        try {
            console.log('Enviando review:', { nota, comentario });
            // QUANDO FOR CONECTAR:
            // Aqui você faria a chamada POST para o backend
            // await api.post(`/review/ambiente/${id}`, { nota, comentario });
            
            alert('Review enviado com sucesso!');
            navigate('/'); // Volta para a página inicial após o sucesso
        } catch (error) {
            console.error("Erro ao enviar review:", error);
            alert('Falha ao enviar review.');
        }
    };

    if (loading) {
        return <p>Carregando informações do recurso...</p>;
    }

    if (!recurso) {
        return <p>Recurso não encontrado.</p>;
    }

    return (
        <div /*className={styles.container}*/>
            <h1>Deixar um Review para {recurso.identificacao}</h1>
            <form onSubmit={handleSubmit}>
                {/* Você pode substituir isso por um componente de estrelas mais tarde */}
                <div>
                    <label>Nota (de 1 a 5):</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={nota}
                        onChange={(e) => setNota(parseInt(e.target.value, 10))}
                        required
                    />
                </div>
                <br/>
                <div>
                    <label>Comentário:</label>
                    <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        rows="5"
                        style={{ width: '300px' }}
                    />
                </div>
                <br/>
                <button type="submit">Enviar Review</button>
            </form>
        </div>
    );
};

// A linha mais importante para corrigir o erro:
export default PaginaReview;