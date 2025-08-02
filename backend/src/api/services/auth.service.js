import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService{
    constructor(usuarioModel){
        this.usuarioModel = usuarioModel;
    }
    login = async(email,senha) =>{

        if(!email || !senha){
            const error = new Error('Email e senha são obrigatórios');
            error.statusCode = 400;
            throw error;
        }
        const user = await this.usuarioModel.findByEmail(email);
        if (!user) {
            const error = new Error('Email ou senha inválidos.');
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            const error = new Error('Email ou senha inválidos.');
            error.statusCode = 401; // Unauthorized
            throw error;
        }

        if (user.status !== 'ativo') {
            const error = new Error('Acesso negado. A sua conta não está ativa.');
            error.statusCode = 403; // Forbidden
            throw error;
        }

        // Se tudo estiver correto, gere o token
        const payload = {
            cpf: user.cpf,
            nome: user.nome,
            tipo: user.tipo
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        return token;
    }
}

export default AuthService;