import pool from '../../config/database.js';
import AmbienteModel from '../models/ambiente.model.js';
import ReservaModel from '../models/reserva.model.js';

const ambienteModel = new AmbienteModel(pool); 


class AmbienteService {
    async create({ tipo, identificacao }) {
        if (!identificacao || identificacao.trim() === '') {
        throw new Error("Identificador obrigatório");
        }

        const existente = await ambienteModel.findByIdentificador(identificacao);
        if (existente) {
        throw new Error("Identificador já cadastrado");
        }

        const novoAmbiente = await ambienteModel.create({
        identificacao,
        tipo
        });

        return novoAmbiente;
    }

    // Exclusão com verificação de reservas futuras
    async delete(ambienteId) {
        
        const ambienteParaDeletar = await ambienteModel.findById(ambienteId);

        if (!ambienteParaDeletar) {
            // Se não existir, lança o erro "não encontrado" imediatamente.
            throw new Error("Ambiente não encontrado para deletar.");
        }

        
        console.log(`\n--- AMBIENTE SERVICE: Iniciando deleção do ambiente ID: ${ambienteId} ---`);

        const params = {
            recurso_id: ambienteId,
            recurso_tipo: 'ambiente'
        };
        console.log('--- AMBIENTE SERVICE: Buscando reservas futuras com os parâmetros:', params);

        const reservasFuturas = await ReservaModel.findFutureByResourceId(params);

        console.log('--- AMBIENTE SERVICE: Resultado da busca por reservas futuras:', reservasFuturas);
        
        if (reservasFuturas && reservasFuturas.length > 0) {
            console.log('--- AMBIENTE SERVICE: CONFLITO! Encontrou reservas. Lançando erro.');
            throw new Error("Não é possível excluir um espaço com reservas futuras");
        }

        console.log('--- AMBIENTE SERVICE: Nenhuma reserva encontrada. Prosseguindo para a deleção.');
        return ambienteModel.remove(ambienteId);
    }

    // Atualização com verificação de duplicidade
    async update(id, dadosParaAtualizar) {

        const ambienteParaAtualizar = await ambienteModel.findById(id);

        if (!ambienteParaAtualizar) {
            // Se não existir, lança o erro "não encontrado" imediatamente.
            throw new Error("Ambiente não encontrado.");
        }

        const { identificacao } = dadosParaAtualizar;

        if (identificacao) {
            const existente = await ambienteModel.findByIdentificador(identificacao);
            if (existente && existente.id !== id) {
                throw new Error("Identificador já cadastrado em outro ambiente.");
            }
            }

        return ambienteModel.update(id, dadosParaAtualizar);
    }

    async findAll(filters = {}) {
        return ambienteModel.findAll(filters);
    }

    async findById(id) {
        const ambiente = await ambienteModel.findById(id);
        if (!ambiente) {
            throw new Error('Ambiente não encontrado.');
        }
    return ambiente;
    }
};

export default new AmbienteService();
