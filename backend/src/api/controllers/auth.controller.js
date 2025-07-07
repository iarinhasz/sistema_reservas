//receber email e senha, verificar no banco e retornar token

import jwt from 'jsonwebtoken';
import pool from '../../config/database.js';

const login = async(req, res) =>{
    try{
        const{email, senha}=req.body;

        if(!email || !senha){
            return res.status(400).json({message: 'email e senha são obrigatórios.'});
        }
        
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];
        
   // console.log('   -> Senha vinda do Postman:', senha);
    //console.log('   -> Senha vinda do Banco (hash):', user.senha);


        const senhaValida = (senha === user.senha);
        
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        const payload = {
            cpf: user.cpf,
            nome: user.nome,
            tipo: user.tipo
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h' // Token expira em 8 horas
        });

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token
        });
    } catch(error){
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
};

export default { login };
