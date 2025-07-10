import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';

const create = async (req, res) => {
    try {
        const {cpf, nome, email, senha,tipo} = req.body;

        if (!cpf ||!nome || !email || !senha || !tipo){
            return res.status(400).json({ message: "Cpf, nome, email, senha e tipo são obrigatórios"});
        }

        const existingUser = await UsuarioModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Este email já está em uso." }); // 409 Conflict
        }

        const newUser = await UsuarioModel.create({
            cpf,
            nome,
            email,
            tipo,
            senha: senha
        });


        res.status(201).json({
            message: "Solicitação de cadastro recebida! Aguardando aprovação do administrador.",
            usuario: newUser
        });

    } catch (error) {
        console.error("Erro ao solicitar cadastro:", error);
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

        const usuario = await UsuarioModel.findByCpf(cpf);
        if (!usuario) {
            return res.status(404).json({ message: "Solicitação de cadastro não encontrada." });
        }

        await UsuarioModel.deleteByCpf(cpf);

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
const listarTodos = async (req, res) => {
    try {
        const usuarios = await UsuarioModel.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

const listarPendentes = async (req, res) => {
    try {
        const usuariosPendentes = await UsuarioModel.findPending(req.query);
        res.status(200).json(usuariosPendentes);
    } catch (error) {
        console.error("Erro ao listar cadastros pendentes:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};


const editarUsuario = async (req, res) => {
    try {
        const { cpf } = req.params; 

        const dadosParaAtualizar = req.body;

        if (Object.keys(dadosParaAtualizar).length === 0) {
            return res.status(400).json({ message: "Pelo menos um campo deve ser fornecido para a edição." });
        }

        const usuarioAtualizado = await UsuarioModel.update(cpf, dadosParaAtualizar);

        if (!usuarioAtualizado) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        
        res.status(200).json({
            message: "Usuário atualizado com sucesso!",
            usuario: usuarioAtualizado
        });

    } catch (error) {
        if (error.code === '23505') { // Código de erro de violação de unicidade do Postgres
            return res.status(409).json({ message: 'O e-mail fornecido já está em uso por outro usuário.' });
        }
        console.error("Erro ao editar usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};


export default {
    create,
    aprovarCadastro,
    rejeitarCadastro,
    listarTodos,
    listarPendentes,
    editarUsuario
};