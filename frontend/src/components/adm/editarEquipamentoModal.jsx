// frontend/src/components/admin/EditarEquipamentoModal.jsx

import { useState } from 'react';
import formStyles from '../../styles/FormPage.module.css';
import api from '../../services/api';
import modalStyles from '../../styles/modal.module.css';
import { DeleteIcon, SaveIcon } from '../icons/index';
import Button from '../shared/Button';

const EditarEquipamentoModal = ({ equipamento, onClose, onSuccess, onDelete}) => {
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
    const handleDelete = async () => {
        // Pede confirmação antes de deletar
        if (window.confirm(`Tem certeza que deseja deletar o equipamento "${equipamento.nome}"?`)) {
            try {
                // Chama a rota DELETE da API
                await api.delete(`/equipamentos/${equipamento.id}`);
                
                // Avisa o componente pai que a deleção foi um sucesso
                onDelete(equipamento.id);
                onClose(); // Fecha o modal
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Erro ao deletar equipamento.');
            }
        }
    };

    return (
        <div className={modalStyles.modalBackdrop} onClick={onClose}>
            <div className={modalStyles.modalContent} onClick={e => e.stopPropagation()}>
                <h2>Editar Equipamento</h2>
                <form onSubmit={handleSubmit}>
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
                        <Button onClick={handleDelete} variant="danger" icon={DeleteIcon}>
                            
                        </Button>
                        <div style={{ flex: 1 }}></div>
                            <Button onClick={onClose} variant="cancel">
                                Cancelar
                            </Button>
                            <Button type="submit" variant="secondary" icon={SaveIcon}>
                                Salvar Alterações
                            </Button>
                        </div>
                    {errorMessage && <p className={formStyles.error}>{errorMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditarEquipamentoModal;