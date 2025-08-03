
class EquipamentoController {
    constructor(EquipamentoService) {
        this.equipamentoService = EquipamentoService;
    }
    create= async (req, res) => {
        try {
            const novoEquipamento = await this.equipamentoService.create(req.body, req.user);
            const equipamentoCompleto = await this.equipamentoService.findById(novoEquipamento.id);
            
            console.log("Objeto enviado para o frontend:", equipamentoCompleto);

            res.status(201).json({
                message: "Equipamento criado com sucesso!",
                equipamento: equipamentoCompleto
            });
        } catch (error) {
            if (error.message.includes("obrigatórios")) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes("Já existe um equipamento")) {
                return res.status(409).json({ message: error.message });
            }

            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    listAll = async (req, res) => {
        try {
            const filtros = req.query;
            const equipamentos = await this.equipamentoService.findAll(filtros);
            res.status(200).json(equipamentos);
        } catch (error) {
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    getById = async (req, res) => {
        try {
            const { id } = req.params;
            const equipamento = await this.equipamentoService.findById(parseInt(id, 10));
            res.status(200).json(equipamento);
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    update = async (req, res) => {
        try {
            const { id } = req.params;
            const equipamentoAtualizado = await this.equipamentoService.update(parseInt(id, 10), req.body);
            res.status(200).json({
                message: 'Equipamento atualizado com sucesso!',
                equipamento: equipamentoAtualizado
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("Nenhum campo fornecido")) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    delete = async (req, res) => {
        try {
            const { id } = req.params;
            
            console.log(`CONTROLLER: ID a ser deletado: ${id}`);

            const equipamentoDeletado = await this.equipamentoService.remove(parseInt(id, 10));
            
            console.log("CONTROLLER: Serviço executado com sucesso. Equipamento retornado:", equipamentoDeletado);
            if (!equipamentoDeletado) {
                console.log("CONTROLLER: Serviço retornou um valor 'falsy', mas não lançou erro. Forçando erro 404.");
                return res.status(404).json({ message: 'Equipamento não encontrado após a deleção.' });
            }
            res.status(200).json({
                message: 'Equipamento deletado com sucesso!',
                equipamentoDeletado: equipamentoDeletado
            });
        } catch (error) {
            console.error("CONTROLLER: A execução caiu no bloco CATCH. O erro é:", error);

            if (error.message.includes("não encontrado para deletar")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("reservas futuras")) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async findAll(req, res){
        try {
            const equipamentos = await this.equipamentoService.findAll(req.query);
            res.status(200).json(equipamentos);
        } catch (error) {
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}

export default EquipamentoController;