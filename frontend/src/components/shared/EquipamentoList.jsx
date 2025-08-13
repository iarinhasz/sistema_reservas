import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar o Link para a navegação
import api from '../../services/api';
import { EditIcon } from '../icons';
import Button from './Button';

import tableStyles from '../../styles/Table.module.css';
import listStyles from '../../styles/List.module.css';

// O componente agora recebe o ID do ambiente e a "função" do usuário
const EquipamentosList = ({ ambienteId, userRole, onEditEquipamento }) => {
    const [equipamentos, setEquipamentos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ambienteId) return;
        const fetchEquipamentos = async () => {
            setLoading(true);
            try {
                // A URL no backend deve ser /equipamentos?ambienteId=...
                const response = await api.get(`/equipamentos?ambienteId=${ambienteId}`);
                setEquipamentos(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar equipamentos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipamentos();
    }, [ambienteId]);

    if (loading) {
        return <p>Carregando equipamentos...</p>;
    }

    if (equipamentos.length === 0) {
        return <p>Nenhum equipamento cadastrado para este ambiente.</p>;
    }

    switch (userRole) {
        case 'admin':
            return (
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(eq => (
                            <tr key={eq.id}>
                                <td>{eq.nome}</td>
                                <td>{eq.marca || 'N/A'}</td>
                                <td>{eq.modelo || 'N/A'}</td>
                                <td>
                                    <Button 
                                        variant="primary" 
                                        onClick={() => onEditEquipamento(eq)}
                                    >
                                        <EditIcon />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        case 'professor':
            return (
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Marca</th>
                            <th>Modelo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(eq => (
                            <tr key={eq.id}>
                                <td>{eq.nome}</td>
                                <td>{eq.marca || 'N/A'}</td>
                                <td>{eq.modelo || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );

        case 'aluno':
        default:
            return (
                <ul className={listStyles.simpleList}>
                    {equipamentos.map((equipamento) => (
                        <li key={equipamento.id} className={listStyles.simpleListItem}>
                            {equipamento.nome} - (Quantidade Total: {equipamento.quantidade_total})
                        </li>
                    ))}
                </ul>
            );
    }
};

export default EquipamentosList;