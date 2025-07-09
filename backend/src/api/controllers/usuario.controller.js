import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';

const create = async (req, res) => {
    try {
        const {cpf, nome, email, senha } = req.body;

        if (!cpf ||!nome || !email || !senha) {
            return res.status(400).json({ message: "Cpf, nome, email e senha são obrigatórios." });
        }

        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Este email já está em uso." }); // 409 Conflict
        }

        const newUser = await UsuarioModel.create({
            cpf,
            nome,
            email,
            senha: senha
        });


        res.status(201).json({
            message: "Usuário criado com sucesso!",
            usuario: newUser
        });

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};
const aprovarCadastro = async (req, res) => {
    try {
        const { cpf } = req.params;
        const usuarioAprovado = await UsuarioModel.updateStatus(cpf, 'ativo');
        
        if (!usuarioAprovado) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        await EmailService.sendApprovalEmail(usuarioAprovado);

        res.status(200).json({ message: "Usuário aprovado com sucesso!" });
    } catch (error) {
        console.error("Erro ao aprovar usuário:", error)
        res.status(500).json({ message: "Erro ao aprovar usuário." });
    }
};
const rejeitarCadastro = async (req, res) => {
    try {
        const { cpf } = req.params;
        
        const { justificativa } = req.body;

        if (!justificativa) {
            return res.status(400).json({ message: "O motivo da rejeição é obrigatório." });
        }

        const usuario = await UsuarioModel.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: "Solicitação de cadastro não encontrada." });
        }

        await UsuarioModel.deleteById(id);

        await EmailService.sendRejectionEmail(usuario, justificativa);

        res.status(200).json({ message: "Usuário rejeitado com sucesso!" });
        
        if (!usuarioRejeitado) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        // 2. CHAMA O SERVIÇO PARA ENVIAR O E-MAIL
        await EmailService.sendRejectionEmail(usuarioRejeitado);
        res.status(200).json({ message: "Usuário rejeitado com sucesso!" });

    } catch (error) {
        console.error("Erro ao rejeitar usuário:", error);
        res.status(500).json({ message: "Erro ao rejeitar usuário." });
    }

};



export default {
    create,
    aprovarCadastro,
    rejeitarCadastro
};