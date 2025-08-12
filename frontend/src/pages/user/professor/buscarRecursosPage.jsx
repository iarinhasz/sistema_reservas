// src/pages/user/professor/BuscarRecursosPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const BuscarRecursosPage = () => {
    const [ambientes, setAmbientes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmbientes = async () => {
            try {
                const response = await api.get('/ambientes');
                setAmbientes(response.data);
            } catch (err) {
                console.error("Erro ao buscar ambientes:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAmbientes();
    }, []);

    if (loading) {
        return <p>Carregando ambientes disponíveis...</p>;
    }

    return (
        <div>
            <h1>Recursos Disponíveis para Reserva</h1>
            {ambientes.length > 0 ? (
                <ul>
                    {ambientes.map(ambiente => (
                        <li key={ambiente.id}>
                            {ambiente.identificacao} - {ambiente.tipo}
                            <Link to={`/ambientes/${ambiente.id}`}>
                                <button>Ver Agenda e Reservar</button>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nenhum ambiente disponível para reserva no momento.</p>
            )}
        </div>
    );
};

export default BuscarRecursosPage;