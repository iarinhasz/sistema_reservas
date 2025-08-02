class AvaliacaoModel {
    constructor(pool) {
        this.pool = pool;
    }

    async create({ reserva_id, usuario_cpf, nota, comentario }) { /* ...código para inserir uma nova avaliação... */ }
    
    async findByReservaId(reserva_id) { /* ...código para buscar uma avaliação... */ }
}
export default AvaliacaoModel;