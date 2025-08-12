import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api'; 
import styles from './RequestAccessPage.module.css'; 

const RequestAccessPage = () => {
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        tipo: 'aluno', // Valor padrão
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            await api.post('/usuarios/solicitar', {
                nome: formData.nome,
                cpf: formData.cpf,
                email: formData.email,
                senha: formData.senha,
                tipo: formData.tipo,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao enviar solicitação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.requestCard}>
                {success ? (
                    <div className={styles.successMessage}>
                        <h2>Solicitação Enviada!</h2>
                        <p>Sua solicitação de cadastro foi enviada com sucesso. Você será notificado por email quando seu acesso for liberado.</p>
                        <Link to="/login" className={styles.backButton}>Voltar para o Login</Link>
                    </div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <h2>Solicitação de Cadastro</h2>
                            <p>Seu acesso será liberado após aprovação.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="nome">Nome Completo</label>
                            </div>
                            <div className={styles.formGroup}>
                                <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="cpf">CPF</label>
                            </div>
                            <div className={styles.formGroup}>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="email">Email</label>
                            </div>
                            <div className={styles.formGroup}>
                                <input type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="senha">Senha</label>
                            </div>
                            <div className={styles.formGroup}>
                                <input type="password" id="confirmarSenha" name="confirmarSenha" value={formData.confirmarSenha} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="confirmarSenha">Confirmar Senha</label>
                            </div>

                            <div className={styles.radioGroup}>
                                <label className={styles.radioLabel}>
                                    <input type="radio" name="tipo" value="aluno" checked={formData.tipo === 'aluno'} onChange={handleChange} />
                                    <span className={styles.radioCircle}></span>
                                    Aluno
                                </label>
                                <label className={styles.radioLabel}>
                                    <input type="radio" name="tipo" value="professor" checked={formData.tipo === 'professor'} onChange={handleChange} />
                                    <span className={styles.radioCircle}></span>
                                    Professor
                                </label>
                            </div>

                            {error && <p className={styles.errorMessage}>{error}</p>}
                            
                            <button type="submit" className={styles.submitButton} disabled={loading}>
                                {loading ? 'Enviando...' : 'Enviar Solicitação'}
                            </button>

                            <p className={styles.signInText}>
                                Já tem uma conta? <Link to="/login">Faça o login</Link>
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestAccessPage;