import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar o Link para a navegação
import api from '../../services/api';
import styles from '../css/EquipamentoList.module.css';
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

    const renderContent = () => {
        if (loading) {
            return <p>Carregando equipamentos...</p>;
        }

        if (equipamentos.length === 0) {
            return <p>Nenhum equipamento cadastrado para este ambiente.</p>;
        }

        // Usamos um switch para decidir o que renderizar com base no userRole
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
                                            onClick={() => onEditEquipamento(eq)} // Chama a função passando o equipamento
                                        >
                                            <EditIcon />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            // 2. NOVO CASO ESPECÍFICO PARA O PROFESSOR
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
                return (
                    <ul className={listStyles.list}>
                        {equipamentos.map((equipamento) => (
                            <li key={equipamento.id} className={listStyles.listItem}>
                                <span>{equipamento.nome}</span>
                                <Link to={`/aluno/reservar-equipamento/${equipamento.id}`}>
                                    <Button variant="secondary">Reservar</Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                );
            
            // 3. O 'default' agora serve apenas para visitantes (não logados)
            default:
                return (
                    <ul className={listStyles.simpleList}>
                        {equipamentos.map((equipamento) => (
                            <li key={equipamento.id} className={listStyles.simpleListItem}>
                                {equipamento.nome}
                            </li>
                        ))}
                    </ul>
                );
        }
    };

    return <div className={styles.container}>{renderContent()}</div>;
};

export default EquipamentosList;