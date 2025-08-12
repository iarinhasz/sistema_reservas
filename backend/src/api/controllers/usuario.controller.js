
export default class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }

    aprovarCadastro = async (req, res) => {
        try {
            const { cpf } = req.params;
            const usuarioAprovado = await this.usuarioService.aprovarCadastro(cpf);
            
            res.status(200).json({ message: "Usuário aprovado com sucesso!", usuario: usuarioAprovado });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
    
    rejeitarCadastro = async (req, res) => {
        try {
            const { cpf } = req.params;
            const { justificativa } = req.body;
            await this.usuarioService.rejeitarCadastro(cpf, justificativa);
            res.status(200).json({ message: "Usuário rejeitado com sucesso!" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    listarTodos = async (req, res) => {
        try {
            const usuarios = await this.UsuarioModel.findAll();
            res.status(200).json(usuarios);
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    };

    listarPendentes = async (req, res) => {
        try {
            const resultado = await this.usuarioService.listarPendentes(req.query);
            res.status(200).json(resultado);
        } catch (error) {
            console.error("Erro ao listar cadastros pendentes:", error);
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    };

    editarUsuario = async (req, res) => {
        try {
            const { cpf } = req.params;
            const dadosParaAtualizar = req.body;

            const usuarioAtualizado = await this.usuarioService.editarUsuario(cpf, dadosParaAtualizar, req.user); // Passando o usuário logado para verificação de permissão

            res.status(200).json({
                message: "Usuário atualizado com sucesso!",
                usuario: usuarioAtualizado
            });
        } catch (error) {
            console.error("Erro ao editar usuário:", error);
            if (error.message.includes("permissão") || error.message.includes("campo")) {
                return res.status(403).json({ message: error.message });
            }
             if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("já em uso")) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    };
}
