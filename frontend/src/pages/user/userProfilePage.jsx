import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './userProfilePage.module.css';
import Button from '../../components/shared/Button';

const UserProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setNome(user?.nome || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleBack = () => {
    navigate(`/${user.tipo}`);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      // Apesar de nome e email estarem desabilitados, envio para manter consistência se quiser liberar edição futuramente
      const payload = { nome, email };
      await api.patch(`/usuarios/${user.cpf}`, payload);
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarNovaSenha) {
      setErrorMessage('As novas senhas não coincidem.');
      return;
    }
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const payload = { senhaAtual, novaSenha };
      await api.patch(`/usuarios/${user.cpf}/senha`, payload);
      setSuccessMessage('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>Usuário não autenticado.</p>;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.pageHeader}>
        <h1>Meu Perfil</h1>
        <Button onClick={handleBack} variant="cancel">
          Voltar
        </Button>
      </div>

      {successMessage && <p className={styles.success}>{successMessage}</p>}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <div className={styles.formWrapper}>
        <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
          <h2>Dados Pessoais</h2>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome Completo</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} disabled required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled required />
          </div>
          <div className={styles.formGroup}>
            <label>CPF</label>
            <input type="text" value={user?.cpf} disabled />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>

        <form onSubmit={handlePasswordUpdate} className={styles.profileForm}>
          <h2>Alterar Senha</h2>
          <div className={styles.formGroup}>
            <label htmlFor="senhaAtual">Senha Atual</label>
            <input id="senhaAtual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="novaSenha">Nova Senha</label>
            <input id="novaSenha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmarNovaSenha">Confirmar Nova Senha</label>
            <input id="confirmarNovaSenha" type="password" value={confirmarNovaSenha} onChange={(e) => setConfirmarNovaSenha(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;