
export default class UsuarioService {
    constructor(usuarioModel, emailService) {
        this.usuarioModel = usuarioModel;
        this.emailService = emailService;
    }

    //Aprova um cadastro pendente.
    async aprovarCadastro(cpf) {
        const usuarioAprovado = await this.usuarioModel.updateStatus(cpf, 'ativo');
        if (!usuarioAprovado) {
            throw new Error("Usuário não encontrado.");
        }
        await this.emailService.sendApprovalEmail(usuarioAprovado);
        return usuarioAprovado;
    }

    async rejeitarCadastro(cpf, justificativa) {
        // Regra de negócio: "Tentativa de rejeitar um cadastro sem informar a justificativa"
        if (!justificativa) {
            throw new Error("O motivo da rejeição é obrigatório.");
        }
        
        const usuario = await this.usuarioModel.findByCpf(cpf);
        if (!usuario) {
            throw new Error("Usuário não encontrado.");
        }
        await this.usuarioModel.deleteByCpf(cpf);
        await this.emailService.sendRejectionEmail(usuario, justificativa);
        
        return usuario;
    }
    /**
     * Lista todos os usuários com status 'pendente'.
     */
    async listarPendentes() {
        return this.usuarioModel.findPending();
    }
}

