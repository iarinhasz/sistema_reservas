
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
        
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }
        console.log("--- DEBUG DE LOGIN ---");
        console.log("Senha recebida do Cypress:", `"${senha}"`);
        console.log("Senha vinda do Banco:", `"${user.senha}"`);
        const senhaValida = (senha === user.senha);
        console.log("As senhas são idênticas? (===):", senhaValida);
        console.log("----------------------");


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

export default { login };