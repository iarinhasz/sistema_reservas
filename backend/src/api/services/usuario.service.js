import bcrypt from 'bcrypt';

export default class UsuarioService {
    constructor(usuarioModel, emailService) {
        this.usuarioModel = usuarioModel;
        this.emailService = emailService;
    }

    /**
     * Processa a lógica de negócio para a solicitação de cadastro.
     * @param {object} dados - Dados vindos do controller (req.body).
     * @returns {Promise<object>} O usuário recém-criado.
     */
    async solicitarCadastro(dados) {
        const { cpf, nome, email, senha, tipo } = dados;

        // 1. Validação de dados essenciais
        if (!cpf || !nome || !email || !senha || !tipo) {
            throw new Error("Cpf, nome, email, senha e tipo são obrigatórios");
        }

        const cpfApenasNumeros = cpf.replace(/\D/g, '');
        if (cpfApenasNumeros.length !== 11) {
            throw new Error("O CPF informado é inválido.");
        }

        // 2. Validação de regras de negócio (evitar duplicidade)
        if (await this.usuarioModel.findByCpf(cpfApenasNumeros)) {
            throw new Error("Este CPF já está cadastrado.");
        }
        
        if (await this.usuarioModel.findByEmail(email)) {
            throw new Error("Este email já está em uso.");
        }

        // 3. Lógica de segurança: Criar o hash da senha
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        // 4. Delega a criação para a camada de dados
        const novoUsuario = await this.usuarioModel.create({
            cpf: cpfApenasNumeros,
            nome,
            email,
            senhaHash,
            tipo
        });

        return novoUsuario;
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
    async listarPendentes() {
        return this.usuarioModel.findPending();
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
            error.statusCode = 403; // Forbidden
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

