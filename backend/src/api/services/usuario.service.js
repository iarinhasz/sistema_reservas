import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';
import UsuarioController from "../controllers/usuario.controller.js";

const UsuarioService = {
    //Aprova um cadastro pendente.
    async aprovarCadastro(cpf) {
        const usuarioAprovado = await UsuarioModel.updateStatus(cpf, 'ativo');
        if (!usuarioAprovado) {
            throw new Error("Usuário não encontrado.");
        }
        // Dispara o envio do e-mail de aprovação
        await EmailService.sendApprovalEmail(usuarioAprovado);
        return usuarioAprovado;
    },

    //Rejeita um cadastro pendente.

    async rejeitarCadastro(cpf, justificativa) {
        // Regra de negócio: "Tentativa de rejeitar um cadastro sem informar a justificativa"
        if (!justificativa) {
            throw new Error("O motivo da rejeição é obrigatório.");
        }
        
        const usuario = await UsuarioModel.findByCpf(cpf);
        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }
        // Deleta o registro do banco e dispara o e-mail de rejeição
        await UsuarioModel.deleteByCpf(cpf);
        await EmailService.sendRejectionEmail(usuario, justificativa);
        
        return usuario;
    },

    /**
     * Lista todos os usuários com status 'pendente'.
     */
    async listarPendentes() {
        return UsuarioModel.findPending();
    }
};

export default UsuarioService;