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

    async listarTodos() {
        return this.usuarioModel.findAll();
    }
}

