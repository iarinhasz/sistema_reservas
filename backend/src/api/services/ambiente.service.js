import AmbienteModel from '../models/ambiente.model.js';
import ReservaModel from '../models/reserva.model.js';

const AmbienteService = {
    async create({ tipo, identificacao }) {
        if (!identificacao || identificacao.trim() === '') {
        throw new Error("Identificador obrigatório");
        }

        const existente = await AmbienteModel.findByIdentificador(identificacao);
        if (existente) {
        throw new Error("Identificador já cadastrado");
        }

        const novoAmbiente = await AmbienteModel.create({
        identificacao,
        tipo
        });

        return novoAmbiente;
    },

    // Exclusão com verificação de reservas futuras
    async delete(ambienteId) {
        const reservasFuturas = await ReservaModel.findFutureByResourceId({
            recurso_id: ambienteId,
            recurso_tipo: 'ambiente'
        });

        if (reservasFuturas && reservasFuturas.length > 0) {
            throw new Error("Não é possível excluir um espaço com reservas futuras");
        }
        return AmbienteModel.remove(ambienteId);
    },

    // Atualização com verificação de duplicidade
    async update(id, dadosParaAtualizar) {
        const { identificacao } = dadosParaAtualizar;

        if (identificacao) {
        const existente = await AmbienteModel.findByIdentificador(identificacao);
        if (existente && existente.id !== id) {
            throw new Error("Identificador já cadastrado em outro ambiente.");
        }
        }

        return AmbienteModel.update(id, dadosParaAtualizar);
    },

    async findAll(filters = {}) {
        return AmbienteModel.findAll(filters);
    },

    async findById(id) {
        return AmbienteModel.findById(id);
    }
};

export default AmbienteService;
