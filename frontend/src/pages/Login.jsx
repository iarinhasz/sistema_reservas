import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // Chamada para sua API de login no backend
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email,
                senha
            });
            
            console.log('Login bem-sucedido!', response.data);
            // Aqui você guardaria o token (ex: no localStorage) e redirecionaria o usuário
            localStorage.setItem('authToken', response.data.token);
            window.location.href = '/dashboard'; // Redireciona para a página principal

        } catch (error) {
            console.error('Erro no login:', error.response.data.message);
            setErro(error.response.data.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" required />
                <button type="submit">Entrar</button>
            </form>
            {erro && <p style={{ color: 'red' }}>{erro}</p>}
        </div>
    );
}

export default Login;