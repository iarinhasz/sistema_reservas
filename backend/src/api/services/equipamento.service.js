
import EquipamentoModel from '../models/equipamento.model.js';
import ReservaModel from '../models/reserva.model.js';

const EquipamentoService = {
    /**
     * Valida e cria um novo equipamento.
     */
    async create(dadosEquipamento) {
        const { nome, quantidade_total, ambiente_id} = dadosEquipamento;
        console.log('[DEBUG create] dadosEquipamento:', dadosEquipamento);

        if (nome === undefined || quantidade_total === undefined) {
            throw new Error("Os campos 'nome' e 'quantidade_total' são obrigatórios.");
        }
        console.log('[DEBUG create] checando duplicidade para:', { nome, ambiente_id });

        const existente = await EquipamentoModel.findByNomeEAmbiente(nome, ambiente_id);

        console.log('[DEBUG create] existente encontrado:', existente);

        if (existente) {
            // Lança erro que será tratado no controller
            throw new Error("Já existe um equipamento com esse nome neste ambiente");
        }

        return EquipamentoModel.create(dadosEquipamento);
    },

    /**
     * Atualiza um equipamento.
     */
    async update(id, dadosParaAtualizar) {
        if (Object.keys(dadosParaAtualizar).length === 0) {
            throw new Error('Nenhum campo fornecido para atualização.');
        }

        const equipamentoAtualizado = await EquipamentoModel.update(id, dadosParaAtualizar);
        if (!equipamentoAtualizado) {
            throw new Error('Equipamento não encontrado ou nenhum campo válido foi fornecido.');
        }
        return equipamentoAtualizado;
    },

    /**
     * Deleta um equipamento após verificar se não há reservas futuras.
     */
    async remove(id) {
        // Regra de Negócio: Não pode deletar se tiver reservas futuras
        const reservasFuturas = await ReservaModel.findFutureByResourceId({
            recurso_id: id,
            recurso_tipo: 'equipamento'
        });

        if (reservasFuturas && reservasFuturas.length > 0) {
            throw new Error("Não é possível excluir o equipamento pois ele possui reservas futuras");
        }

        const equipamentoDeletado = await EquipamentoModel.remove(id);
        if (!equipamentoDeletado) {
            throw new Error('Equipamento não encontrado para deletar.');
        }
        return equipamentoDeletado;
    },

    /**
     * Funções simples que apenas repassam a chamada para o Model.
     */
    async findAll(filters = {}) {
        return EquipamentoModel.findAll(filters);
    },

    async findById(id) {
        const equipamento = await EquipamentoModel.findById(id);
        if (!equipamento) {
            throw new Error('Equipamento não encontrado.');
        }
        return equipamento;
    }
};

export default EquipamentoService;