// src/api/controllers/ambiente.controller.js
import ambienteService from '../services/ambiente.service.js';

class AmbienteController{

    async listAll(req, res){
        try {
            const filters = req.query;
            const ambientes = await ambienteService.findAll(filters);
            res.status(200).json(ambientes);
        } catch (error) {
            console.error('Erro ao listar ambientes:', error.message ,error.stack);
            res.status(500).json({ message: 'Erro interno no servidor' });
        }
    }

    async create(req, res){
        try {
            const novoAmbiente = await ambienteService.create(req.body);
            res.status(201).json({ message: "Ambiente criado com sucesso!", ambiente: novoAmbiente });
        } catch (error) {
            if (error.message === "Identificador já cadastrado") {
                return res.status(409).json({ message: error.message });
            }
            if (error.message === "Identificador obrigatório") {
                return res.status(400).json({ message: error.message });
            }
            console.error('Erro ao criar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor." });
        }
    }

    async getByI(req, res){
        try {
            const { id } = req.params; 
            const ambiente = await ambienteService.findById(parseInt(id, 10));
            res.status(200).json(ambiente);
        } catch (error) {
            if (error.message === 'Ambiente não encontrado.') {
                return res.status(404).json({ message: error.message });
            }
            console.error('Erro ao buscar ambiente por ID:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async update(req, res){
        try {
            const { id } = req.params;
            const ambienteAtualizado = await ambienteService.update(parseInt(id, 10), req.body);
            res.status(200).json({
                message: 'Ambiente atualizado com sucesso!',
                ambiente: ambienteAtualizado
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("já cadastrado")) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao atualizar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    async delete_ (req, res){
        try {
            const { id } = req.params;
            const ambienteDeletado = await ambienteService.delete(parseInt(id, 10));
            res.status(200).json({
                message: 'Ambiente deletado com sucesso!',
                ambienteDeletado: ambienteDeletado
            });
        } catch (error) {
            if (error.message.includes("não encontrado")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("reservas futuras")) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao deletar ambiente:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }
}

export default new AmbienteController();