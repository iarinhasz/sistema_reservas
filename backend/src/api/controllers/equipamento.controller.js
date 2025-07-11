// src/api/controllers/equipamento.controller.js

import EquipamentoService from '../services/equipamento.service.js';

const create = async (req, res) => {
    try {
        const novoEquipamento = await EquipamentoService.create(req.body);
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
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const listAll = async (req, res) => {
    try {
        const filters = req.query;

        const equipamentos = await EquipamentoService.findAll(filters);
        res.status(200).json(equipamentos);
    } catch (error) {
        console.error('Erro ao listar equipamentos:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamento = await EquipamentoService.findById(parseInt(id, 10));
        res.status(200).json(equipamento);
    } catch (error) {
        if (error.message.includes("não encontrado")) {
            return res.status(404).json({ message: error.message });
        }
        console.error('Erro ao buscar equipamento por ID:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamentoAtualizado = await EquipamentoService.update(parseInt(id, 10), req.body);
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
        console.error('Erro ao atualizar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const delete_ = async (req, res) => {
    try {
        const { id } = req.params;
        const equipamentoDeletado = await EquipamentoService.remove(parseInt(id, 10));
        res.status(200).json({
            message: 'Equipamento deletado com sucesso!',
            equipamentoDeletado: equipamentoDeletado
        });
    } catch (error) {
        console.log("--- ERRO CAPTURADO NO CONTROLLER ---");
        console.log("Tipo do Erro:", typeof error);
        console.log("O objeto de erro completo:", error);
        console.log("A mensagem do erro (error.message):", error.message);
        console.log("-------------------------------------");

        if (error.message.includes("não encontrado para deletar")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("reservas futuras")) {
            return res.status(409).json({ message: error.message });
        }
        console.error('Erro ao deletar equipamento:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export default { create, listAll, getById, update, delete: delete_ };