import AmbienteModel from '../models/ambiente.model.js';

const listAll = async (req, res) => {
    try {
        const ambientes = await AmbienteModel.findAll();
        res.status(200).json(ambientes);
    } catch (error) {
        console.error('Erro ao listar ambientes:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const create = async (req, res) => {
    try {
        const { identificacao, tipo, status } = req.body;

        if (!identificacao) {
            return res.status(400).json({ message: 'O campo "identificacao" é obrigatório.' });
        }

        // Chamamos o model para criar o ambiente no banco
        const novoAmbiente = await AmbienteModel.create({ identificacao, tipo, status });

        res.status(201).json(novoAmbiente);
    } catch (error) {
        console.error('Erro ao criar ambiente:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const ambienteId = parseInt(id, 10);

        // Chamamos o model para buscar o ambiente
        const ambiente = await AmbienteModel.findById(ambienteId);

        if (!ambiente) {
            return res.status(404).json({ message: 'Ambiente não encontrado.' });
        }
    
        res.status(200).json(ambiente);
    } catch (error) {
        console.error('Erro ao buscar ambiente por ID:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const ambienteId = parseInt(id, 10);
        const dadosParaAtualizar = req.body;

        const ambienteExistente = await AmbienteModel.findById(ambienteId);
        if (!ambienteExistente) {
            return res.status(404).json({ message: 'Ambiente não encontrado.' });
        }

        // Chamamos o model para atualizar
        const ambienteAtualizado = await AmbienteModel.update(ambienteId, dadosParaAtualizar);

        res.status(200).json({
            message: 'Ambiente atualizado com sucesso!',
            ambiente: ambienteAtualizado
        });
    } catch (error) {
        console.error('Erro ao atualizar ambiente:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const delete_ = async (req, res) => {
    try {
        const { id } = req.params;
        const ambienteId = parseInt(id, 10);

        // Chamamos o model para deletar
        const ambienteDeletado = await AmbienteModel.remove(ambienteId);

        if (!ambienteDeletado) {
            return res.status(404).json({ message: 'Ambiente não encontrado para deletar.' });
        }

        res.status(200).json({
            message: 'Ambiente deletado com sucesso!',
            ambienteDeletado: ambienteDeletado
        });
    } catch (error) { 
        console.error('Erro ao deletar ambiente:', error);
        if (error.code === '23503') {
            return res.status(409).json({ message: 'Não é possível deletar este ambiente pois ele possui associações.' });
        }
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

export default {
    create,
    listAll,
    getById,
    update,
    delete: delete_,
};