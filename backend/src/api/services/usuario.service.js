import bcrypt from 'bcrypt';

export default class UsuarioService {
    constructor(usuarioModel, emailService, appEmitter) {
        this.usuarioModel = usuarioModel;
        this.emailService = emailService;
        this.appEmitter = appEmitter;
    }

    async solicitarCadastro(dados) {
        const { cpf, nome, email, senha, tipo } = dados;

        if (!cpf || !nome || !email || !senha || !tipo) {
            throw new Error("Todos os campos são obrigatórios.");
        }
        
        const cpfApenasNumeros = cpf.replace(/\D/g, '');
        if (await this.usuarioModel.findByCpf(cpfApenasNumeros)) {
            throw new Error("Este CPF já está cadastrado.");
        }
        if (await this.usuarioModel.findByEmail(email)) {
            throw new Error("Este email já está em uso.");
        }

        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const novoUsuario = await this.usuarioModel.create({
            cpf: cpfApenasNumeros,
            nome,
            email,
            senhaHash,
            tipo
        });

        // Garante que o evento é emitido
        if (this.appEmitter) {
            this.appEmitter.emit('usuario.solicitado', { usuario: novoUsuario });
            console.log(`[Event Emitter] Evento 'usuario.solicitado' emitido para ${novoUsuario.email}`);
        }

        return novoUsuario;
    }

    // ... O resto da sua classe (aprovarCadastro, rejeitarCadastro, etc.)
    async aprovarCadastro(cpf) {
        const usuarioAprovado = await this.usuarioModel.updateStatus(cpf, 'ativo');
        if (!usuarioAprovado) {
            throw new Error("Usuário não encontrado.");
        }
        await this.emailService.sendApprovalEmail(usuarioAprovado);
        return usuarioAprovado;
    }

    async rejeitarCadastro(cpf, justificativa) {
        if (!justificativa || justificativa.trim() === '') {
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
    async listarPendentes(options) {
        return this.usuarioModel.findPending(options);
    }

    async listarTodos(filters = {}) {
        return this.usuarioModel.findAll(filters);
    }

    async delete(cpfToDelete, adminUser, adminPassword) {
        if (!adminPassword) {
            const error = new Error("A senha do administrador é obrigatória para confirmar a exclusão.");
            error.statusCode = 400;
            throw error;
        }
        const adminInDb = await this.usuarioModel.findByCpf(adminUser.cpf);
        
        const isPasswordValid = await bcrypt.compare(adminPassword, adminInDb.senha);
        
        if (!isPasswordValid) {
            const error = new Error("Senha do administrador incorreta. Ação não autorizada.");
            error.statusCode = 403;
            throw error;
        }

        const deletedUser = await this.usuarioModel.deleteByCpf(cpfToDelete);
        if (!deletedUser) {
            const error = new Error("Usuário a ser deletado não foi encontrado.");
            error.statusCode = 404;
            throw error;
        }

        return deletedUser;
    }
}
