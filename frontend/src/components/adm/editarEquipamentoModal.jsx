// frontend/src/components/admin/EditarEquipamentoModal.jsx

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import formStyles from '../../pages/adm/css/FormPage.module.css';
import modalStyles from '../css/modal.module.css'

const EditarEquipamentoModal = ({ equipamento, onClose, onSuccess }) => {
    // Inicia o estado do formulário com os dados do equipamento que está sendo editado
    const [formData, setFormData] = useState({
        nome: equipamento.nome || '',
        marca: equipamento.marca || '',
        modelo: equipamento.modelo || '',
        quantidade_total: equipamento.quantidade_total || 1,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await api.patch(`/equipamentos/${equipamento.id}`, formData);
            
            onSuccess(response.data.equipamento); // Avisa a página pai que a atualização foi um sucesso
            onClose(); // Fecha o modal

        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={modalStyles.modalBackdrop} onClick={onClose}>
            <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                <h2>Editar Equipamento</h2>
                <form onSubmit={handleSubmit} className={formStyles.formContainer}>
                    {/* Campos do formulário */}
                    <div className={formStyles.formGroup}>
                        <label htmlFor="nome">Nome do Equipamento</label>
                        <input type="text" id="nome" value={formData.nome} onChange={handleChange} required />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="marca">Marca</label>
                        <input type="text" id="marca" value={formData.marca} onChange={handleChange} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="modelo">Modelo</label>
                        <input type="text" id="modelo" value={formData.modelo} onChange={handleChange} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="quantidade_total">Quantidade</label>
                        <input type="number" id="quantidade_total" value={formData.quantidade_total} onChange={handleChange} />
                    </div>

                    <div className={modalStyles.modalActions}>
                        <button type="button" onClick={onClose} className={modalStyles.cancelButton}>Cancelar</button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                    {errorMessage && <p className={formStyles.error}>{errorMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditarEquipamentoModal;