import { useState} from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';
import { GoogleIcon, EyeIcon, EyeSlashIcon, DeleteIcon, SaveIcon } from '../../components/icons';
import Button from '../../components/shared/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();
    const [rememberMe, setRememberMe] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const handleForgotPassword = (e) => {
    e.preventDefault();

    const adminEmail = import.meta.env.VITE_ADMIN_CONTACT_EMAIL;

    const message = adminEmail
            ? `Para redefinir sua senha, por favor, entre em contato com a administração do sistema através do email: ${adminEmail}`
            : 'Para redefinir sua senha, por favor, entre em contato com a administração do sistema.';

        alert(message);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou senha inválidos.');
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <h2>Bem Vindo!</h2>
                    <p>Entre na sua conta</p>
                </div>
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" " 
                                required
                            />
                            <label htmlFor="email">Endereço de Email</label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <div className={`${styles.inputWrapper} ${styles.passwordWrapper}`}>
                            <input
                                type={isPasswordVisible ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder = " "
                                required
                            />
                            <label htmlFor="password">Senha</label>
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setPasswordVisible(!isPasswordVisible)}
                            >
                            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                            <span className={styles.focusBorder}></span>
                        </div>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    
                    <div className={styles.formOptions}>
                        <label className={styles.rememberWrapper}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className={styles.checkboxLabel}>
                                <span className={styles.checkmark}></span>
                                Lembre-me
                            </span>
                        </label>
                        <a href="#" onClick={handleForgotPassword} className={styles.forgotPassword}>
                            Esqueceu sua senha?
                        </a>
                    </div>

                    <Button type="submit" variant="signIn" disabled={loading} className={loading ? styles.loading : ''}>
                        <span className={styles.btnText}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </span>
                        {loading && <span className={styles.btnLoader}></span>}
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span>ou continue com</span>
                </div>

                <div className={styles.socialLogin}>
                    <Button variant="social" icon={GoogleIcon}>
                        Google
                    </Button>
                </div>

                <div className={styles.signupLink}>
                    <p>Não tem uma conta? <Link to="/solicitar-cadastro">Solicite!</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;