import EquipamentoModel from '../models/equipamento.model.js';

const create = async (req, res) => {
    try {
        const { nome, quantidade_total } = req.body;

        if (nome === undefined || quantidade_total === undefined) {
            return res.status(400).json({ message: "Os campos 'nome' e 'quantidade_total' são obrigatórios." });
        }

        const novoEquipamento = await EquipamentoModel.create(req.body);

        res.status(201).json({
            message: "Equipamento criado com sucesso!",
            equipamento: novoEquipamento
        });

    } catch (error) {
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const listAll = async (req, res) => {
    try {
        const equipamentos = await EquipamentoModel.findAll();
        res.status(200).json(equipamentos);
    } catch (error) { // Adicionado o parâmetro de erro que faltava
        console.error('Erro ao listar equipamentos:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        if (isNaN(equipamentoId)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const equipamento = await EquipamentoModel.findById(equipamentoId);

        if (!equipamento) {
            return res.status(404).json({ message: 'Equipamento não encontrado.' });
        }

        res.status(200).json(equipamento);
    } catch (error) {
        console.error('Erro ao buscar equipamento por ID:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        if (isNaN(equipamentoId)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Nenhum campo fornecido para atualização.' });
        }

        const equipamentoAtualizado = await EquipamentoModel.update(equipamentoId, req.body);

        if (!equipamentoAtualizado) {
            return res.status(404).json({ message: 'Equipamento não encontrado ou nenhum campo válido foi fornecido para atualização.' });
        }

        res.status(200).json({
            message: 'Equipamento atualizado com sucesso!',
            equipamento: equipamentoAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const delete_ = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamentoId = parseInt(id, 10);

        if (isNaN(equipamentoId)) {
            return res.status(400).json({ message: "ID inválido." });
        }

        const equipamentoDeletado = await EquipamentoModel.remove(equipamentoId);

        if (!equipamentoDeletado) {
            return res.status(404).json({ message: 'Equipamento não encontrado para deletar.' });
        }

        res.status(200).json({
            message: 'Equipamento deletado com sucesso!',
            equipamentoDeletado: equipamentoDeletado
        });

    } catch (error) {
        console.error('Erro ao deletar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export default {
    create,
    listAll,
    getById,
    update,
    delete: delete_
};