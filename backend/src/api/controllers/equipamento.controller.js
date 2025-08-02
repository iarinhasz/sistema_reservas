
class EquipamentoController {
    constructor(EquipamentoService) {
        this.equipamentoService = EquipamentoService;
    }
    async create(req, res) {
        try {
            const novoEquipamento = await this.equipamentoService.create(req.body);
            res.status(201).json({
                message: "Equipamento criado com sucesso!",
                equipamento: novoEquipamento
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

    async listAll(req, res) {
        try {
            const filtros = req.query;
            const equipamentos = await this.equipamentoService.findAll(filtros);
            res.status(200).json(equipamentos);
        } catch (error) {
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async getById(req, res) {
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

    async update(req, res) {
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

    async delete_(req, res) {
        try {
            const { id } = req.params;
            const equipamentoDeletado = await this.equipamentoService.remove(parseInt(id, 10));
            res.status(200).json({
                message: 'Equipamento deletado com sucesso!',
                equipamentoDeletado: equipamentoDeletado
            });
        } catch (error) {
            if (error.message.includes("não encontrado para deletar")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("reservas futuras")) {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}

export default EquipamentoController;