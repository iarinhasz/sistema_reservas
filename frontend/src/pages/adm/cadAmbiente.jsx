// src/pages/adm/cadAmbiente.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import styles from './css/FormPage.module.css';

const CadastrarAmbientePage = () => {
    // Estados para controlar os campos do formulário
    const [identificacao, setIdentificacao] = useState('');
    const [tipo, setTipo] = useState('Salas de Aula'); // Um valor padrão

    // Estados para feedback ao usuário
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Hook do React Router para navegar entre páginas
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Impede o recarregamento padrão da página
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        if (!identificacao || !tipo) {
            setErrorMessage('O identificador e o tipo são obrigatórios.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Envia os dados para a API do backend
            await api.post('/ambientes', { identificacao, tipo });

            setSuccessMessage('Ambiente cadastrado com sucesso! Redirecionando...');

            // Após 2 segundos, volta para a página principal do admin
            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (error) {
            // Pega a mensagem de erro da API (ex: "Identificador já cadastrado")
            setErrorMessage(error.response?.data?.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2>Cadastrar Novo Ambiente</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="identificacao">Identificador do Ambiente</label>
                    <input
                        type="text"
                        id="identificacao"
                        value={identificacao}
                        onChange={(e) => setIdentificacao(e.target.value)}
                        placeholder="Ex: Sala A014, Laboratório de Hardware"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="tipo">Tipo de Ambiente</label>
                    <select
                        id="tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                    >
                        <option value="Salas de Aula">Salas de Aula</option>
                        <option value="Laboratórios">Laboratórios</option>
                        <option value="Salas de Reunião">Salas de Reunião</option>
                        <option value="Auditórios">Auditório</option>
                        <option value="Anfiteatro">Anfiteatro</option>
                    </select>
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar Ambiente'}
                </button>

                {/* Mensagens de feedback */}
                {successMessage && <p className={styles.success}>{successMessage}</p>}
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            </form>
        </div>
    );
};

export default CadastrarAmbientePage;