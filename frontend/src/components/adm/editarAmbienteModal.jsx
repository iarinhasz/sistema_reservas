// frontend/src/components/admin/EditarAmbienteModal.jsx

import { useState } from 'react';
import formStyles from '../../styles/FormPage.module.css';
import api from '../../services/api';
import modalStyles from '../../styles/modal.module.css';
import { SaveIcon, DeleteIcon } from '../icons/index';
import Button from '../shared/Button';

const EditarAmbienteModal = ({ ambiente, onClose, onSuccess }) => {
    // O estado do formulário já começa com os dados do ambiente a ser editado
    const [formData, setFormData] = useState({
        identificacao: ambiente.identificacao || '',
        tipo: ambiente.tipo || 'Salas de Aula',
        status: ambiente.status || 'Dispónivel',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    const handleDelete = async () => {
        // Pede confirmação ao usuário para evitar exclusões acidentais
        if (window.confirm(`Tem certeza que deseja deletar o ambiente "${ambiente.identificacao}"? Esta ação não pode ser desfeita.`)) {
            try {
                // Chama a rota DELETE da API para o ambiente específico
                await api.delete(`/ambientes/${ambiente.id}`);
                
                // Avisa o componente pai que a deleção foi um sucesso
                onDelete(ambiente.id);
                onClose(); // Fecha o modal
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Erro ao deletar o ambiente.');
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await api.patch(`/ambientes/${ambiente.id}`, formData);

            onSuccess(response.data.ambiente); // Envia os dados atualizados para a página pai
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
                <h2>Editar Ambiente: {ambiente.identificacao}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="identificacao">Identificador</label>
                        <input type="text" id="identificacao" value={formData.identificacao} onChange={handleChange} required />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="tipo">Tipo</label>
                        <select id="tipo" value={formData.tipo} onChange={handleChange}>
                            <option value="Auditórios">Auditórios</option>
                            <option value="Laboratórios">Laboratórios</option>
                            <option value="Salas de Aula">Salas de Aula</option>
                            <option value="Salas de Reunião">Salas de Reunião</option>
                            <option value="Multifuncionais">Multifuncionais</option>
                        </select>
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="status">Status</label>
                        <select id="status" value={formData.status} onChange={handleChange}>
                            <option value="Disponível">Disponível</option>
                            <option value="Em Manutenção">Em Manutenção</option>
                            <option value="Indisponível">Indisponível</option>
                        </select>
                    </div>

                    <div className={modalStyles.modalActions}>
                        <Button onClick={handleDelete} variant="danger" icon={DeleteIcon}>
                            Deletar
                        </Button>
                        <div style={{ flex: 1 }}></div>

                        <Button onClick={onClose} variant="cancel">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} variant="secondary"> {/* Usando a variante verde */}
                            <SaveIcon />
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                    {errorMessage && <p className={formStyles.error}>{errorMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default EditarAmbienteModal;