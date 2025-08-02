import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para os botões de navegação
import axios from 'axios'; // Para fazer a chamada à API
import './HomePage.css'; // Arquivo de estilos que vamos criar

function HomePage() {
    // Estados para armazenar os dados, o status de carregamento e possíveis erros
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect para buscar os dados da API assim que o componente for montado
    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                // Faz a requisição para o endpoint do backend
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
    }, []); // O array vazio [] garante que isso rode apenas uma vez

    // Função para agrupar os ambientes por tipo
    const ambientesAgrupados = ambientes.reduce((acc, ambiente) => {
        const tipo = ambiente.tipo || 'Outros'; // Agrupa ambientes sem tipo em 'Outros'
        if (!acc[tipo]) {
            acc[tipo] = []; // Cria a categoria se ela não existir
        }
        acc[tipo].push(ambiente);
        return acc;
    }, {});

    // Renderiza mensagens de carregamento ou erro
    if (loading) return <p className="loading-message">Carregando ambientes...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Sistema de Reservas</h1>
                <nav>
                    <Link to="/login" className="header-button">Login</Link>
                    <Link to="/solicitar-cadastro" className="header-button">Solicitar Cadastro</Link>
                </nav>
            </header>

            <main className="ambientes-grid">
                {/* Transforma o objeto de grupos em um array e o percorre para criar as colunas */}
                {Object.entries(ambientesAgrupados).map(([tipo, listaDeAmbientes]) => (
                    <section key={tipo} className="ambiente-coluna">
                        <h2>{tipo}s</h2>
                        <div className="botoes-container">
                            {/* Percorre a lista de ambientes de cada tipo para criar os botões */}
                            {listaDeAmbientes.map(ambiente => (
                                <button key={ambiente.id} className="ambiente-botao">
                                    {ambiente.identificacao}
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}

export default HomePage;