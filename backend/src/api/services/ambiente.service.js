import AmbienteModel from '../models/ambiente.model.js';
import ReservaModel from '../models/reserva.model.js'; 

const AmbienteService ={
    //novo amviente c regras de negocios
    async create({tipo, identificacao}){
        if (!identificacao) {
                throw new Error("Identificador obrigatório");
        }
        const existente = await AmbienteModel.findByIdentificador(identificacao);

        if (existente) {
            throw new Error("Identificador já cadastrado");
        }
        return AmbienteModel.create({ tipo, identificacao });
        
    },
    //deleta ambiente verificando se tem reservas futuras
    async delete(ambienteId) {
        // Regra de negócio: "Não é possível excluir um espaço com reservas futuras"
        const reservasFuturas = await ReservaModel.findFutureByResourceId({
            recurso_id: ambienteId,
            recurso_tipo: 'ambiente'
        });

        if (reservasFuturas && reservasFuturas.length > 0) {
            throw new Error("Não é possível excluir um espaço com reservas futuras");
        }

        return AmbienteModel.remove(ambienteId);
    },
};

export default AmbienteService;