import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './RequestAccessPage.module.css'; // Mude para .module.css

function RequestAccessPage() {
    const [formData, setFormData] = useState({
        cpf: '',
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        tipo: 'aluno',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }
        setLoading(true);
        try {
            const userData = {
                cpf: formData.cpf,
                nome: formData.nome,
                email: formData.email,
                senha: formData.senha,
                tipo: formData.tipo,
            };
            await axios.post('http://localhost:3000/api/usuarios/solicitar', userData);
            setSuccessMessage('Solicitação enviada com sucesso! Aguarde a aprovação.');
            setFormData({ cpf: '', nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'aluno' });
        } catch (err) {
            setError(err.response?.data?.message || 'Ocorreu um erro ao enviar sua solicitação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <h2>Solicitação de Cadastro</h2>
                <p>Seu acesso será liberado após aprovação.</p>
                {!successMessage ? (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}><label htmlFor="nome">Nome Completo</label><input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required /></div>
                        <div className={styles.formGroup}><label htmlFor="cpf">CPF</label><input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} required /></div>
                        <div className={styles.formGroup}><label htmlFor="email">Email</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                        <div className={styles.formGroup}><label htmlFor="senha">Senha</label><input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required /></div>
                        <div className={styles.formGroup}><label htmlFor="confirmarSenha">Confirmar Senha</label><input type="password" id="confirmarSenha" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} required /></div>
                        <fieldset className={styles.formGroup}><legend>Tipo de Usuário</legend><div className={styles.radioGroup}><label><input type="radio" name="tipo" value="aluno" checked={formData.tipo === 'aluno'} onChange={handleChange} /> Aluno</label><label><input type="radio" name="tipo" value="professor" checked={formData.tipo === 'professor'} onChange={handleChange} /> Professor</label></div></fieldset>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button type="submit" className={styles.submitButton} disabled={loading}>{loading ? 'Enviando...' : 'Enviar Solicitação'}</button>
                    </form>
                ) : (
                    <div className={styles.successMessage}><p>{successMessage}</p><Link to="/" className={styles.backLink}>Voltar para a Página Inicial</Link></div>
                )}
            </div>
        </div>
    );
}

export default RequestAccessPage;