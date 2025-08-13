import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importar o Link para a navegação
import api from '../../services/api';
import { EditIcon } from '../icons';
import Button from './Button';

import tableStyles from '../../styles/Table.module.css';
import listStyles from '../../styles/List.module.css';

const EquipamentosList = ({ equipamentos, userRole, onEditEquipamento }) => {
    if (equipamentos === null) {
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
                            <th>Quantidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(eq => (
                            <tr key={eq.id}>
                                <td>{eq.nome}</td>
                                <td>{eq.marca || 'N/A'}</td>
                                <td>{eq.modelo || 'N/A'}</td>
                                <td>{eq.quantidade_total || 'N/A'}</td>
                                <td>
                                    <Button 
                                        variant={eq.temSolicitacaoPendente ? 'alerta' : 'primary'} 
                                        onClick={() => onEditEquipamento(eq)}
                                        title={eq.temSolicitacaoPendente ? 'Este equipamento tem solicitações pendentes!' : 'Editar Equipamento'}
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
                            <th>Disponibilidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipamentos.map(eq => (
                            <tr key={eq.id}>
                                <td>{eq.nome}</td>
                                <td>{eq.marca || 'N/A'}</td>
                                <td>{eq.modelo || 'N/A'}</td>
                                <td>{eq.quantidade_total - (eq.quantidade_reservada || 0)} de {eq.quantidade_total} disponíveis</td>
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
                            <div className={listStyles.itemMainLine}>
                                {equipamento.nome} - (Quantidade Total: {equipamento.quantidade_total})
                            </div>
                            <div className={listStyles.itemSubLine}>
                                {equipamento.marca || 'N/A'} - {equipamento.modelo || 'N/A'}
                            </div>
                        </li>
                    ))}
                </ul>
            );
    }
};

export default EquipamentosList;