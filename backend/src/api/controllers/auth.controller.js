// backend/src/api/controllers/auth.controller.js (VERSÃO CORRIGIDA)

import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }
        
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];

        // MUDANÇA CRÍTICA AQUI:
        // 1. Primeiro, verificamos se o usuário foi encontrado.
        // 2. Se sim, comparamos a senha.
        // Se qualquer uma das condições for falsa, a senha é inválida.
        const senhaValida = user && (senha === user.senha); // Lembre-se que aqui estamos sem bcrypt

        if (!senhaValida) {
            // Esta é a única verificação necessária. Ela cobre tanto o usuário inexistente quanto a senha incorreta.
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        // Se passou, podemos checar outros status do usuário
        if (user.status && user.status !== 'ativo') { // Supondo que você terá uma coluna 'status'
            return res.status(403).json({ message: 'Acesso negado. A sua conta não está ativa.' });
        }

        if (user.status !== 'ativo') {
            return res.status(403).json({ message: 'Acesso negado. A sua conta não está ativa.' });
        }

        const payload = {
            cpf: user.cpf,
            nome: user.nome,
            tipo: user.tipo,
            status: user.status
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

// Não se esqueça de adicionar a função de 'register' se ela também estiver neste arquivo
export default { login };