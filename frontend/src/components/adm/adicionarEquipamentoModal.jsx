
import React, { useState } from 'react';
import api from '../../services/api';
import formStyles from '../../pages/adm/css/FormPage.module.css'; // Reutilizando o estilo dos formulários
import modalStyles from '../../styles/modal.module.css'

const AdicionarEquipamentoModal = ({ ambienteId, onClose, onSuccess }) => {
    const [nome, setNome] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [quantidade_total, setQuantidade] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const novoEquipamentoData = {
                nome,
                marca,
                modelo,
                quantidade_total,
                ambiente_id: ambienteId // Associando o equipamento ao ambiente correto
            };

            const response = await api.post('/equipamentos', novoEquipamentoData);

            // Avisa o componente "pai" (AmbienteDetalhesPage) que o cadastro foi um sucesso
            // e envia o novo equipamento para ele atualizar a lista na tela.
            onSuccess(response.data.equipamento); 

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
                <h2>Adicionar Novo Equipamento</h2>
                <p>Adicionando ao ambiente {ambienteId}</p>

                <form onSubmit={handleSubmit}>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="nome">Nome do Equipamento</label>
                        <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="marca">Marca</label>
                        <input type="text" id="marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="quantidade_total">Quantidade</label>
                        <input type="number" id="quantidade_total" value={quantidade_total} onChange={(e) => setQuantidade(e.target.value)} />
                    </div>
                    <div className={formStyles.formGroup}>
                        <label htmlFor="modelo">Modelo</label>
                        <input type="text" id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                    </div>

                    <div className={modalStyles.modalActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${modalStyles.modalButton} ${modalStyles.cancel}`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${modalStyles.modalButton} ${modalStyles.confirm} ${isSubmitting ? modalStyles.disabled : ''}`}
                        >
                            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                        </button>
                    </div>

                    {errorMessage && <p className={formStyles.error}>{errorMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default AdicionarEquipamentoModal;