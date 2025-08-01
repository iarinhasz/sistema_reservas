class EquipamentoService {
    constructor() {
        // As instâncias dos models agora são propriedades da classe
        this.equipamentoModel = new EquipamentoModel(pool);
        //this.reservaModel = new ReservaModel(pool);
        this.ambienteModel = new AmbienteModel(pool);
    }

    /**
     * Valida e cria um novo equipamento.
     */
    async create(dadosEquipamento) {
        const { nome, quantidade_total, ambiente_id } = dadosEquipamento;

        if (nome === undefined || quantidade_total === undefined || ambiente_id === undefined) {
            throw new Error("Os campos 'nome', 'quantidade_total' e 'ambiente_id' são obrigatórios.");
        }
        
        const ambienteExistente = await this.ambienteModel.findById(ambiente_id);
        if (!ambienteExistente) {
            throw new Error("O ambiente especificado não foi encontrado.");
        }
        
        const existente = await this.equipamentoModel.findByNomeEAmbiente(nome, ambiente_id);
        if (existente) {
            throw new Error("Já existe um equipamento com esse nome neste ambiente");
        }
        
        return this.equipamentoModel.create(dadosEquipamento);
    }

    /**
     * Atualiza um equipamento.
     */
    async update(id, dadosParaAtualizar) {
        if (Object.keys(dadosParaAtualizar).length === 0) {
            throw new Error('Nenhum campo fornecido para atualização.');
        }

        const equipamentoAtualizado = await this.equipamentoModel.update(id, dadosParaAtualizar);
        if (!equipamentoAtualizado) {
            throw new Error('Equipamento não encontrado ou nenhum campo válido foi fornecido.');
        }
        return equipamentoAtualizado;
    }

    /**
     * Deleta um equipamento após verificar se não há reservas futuras.
    */
    async remove(id) {
        const reservasFuturas = await this.reservaModel.findFutureByResourceId({
            recurso_id: id,
            recurso_tipo: 'equipamento'
        });

        if (reservasFuturas && reservasFuturas.length > 0) {
            throw new Error("Não é possível excluir o equipamento pois ele possui reservas futuras");
        }

        const equipamentoDeletado = await this.equipamentoModel.remove(id);
        if (!equipamentoDeletado) {
            throw new Error('Equipamento não encontrado para deletar.');
        }
        return equipamentoDeletado;
    }
    /**
     * Funções simples que apenas repassam a chamada para o Model.
     */
    async findAll(filters = {}) {
        return this.equipamentoModel.findAll(filters);
    }

    async findById(id) {
        const equipamento = await this.equipamentoModel.findById(id);
        if (!equipamento) {
            throw new Error('Equipamento não encontrado.');
        }
        return equipamento;
    }
}

// Exporta a classe, e não mais um objeto.
export default EquipamentoService;