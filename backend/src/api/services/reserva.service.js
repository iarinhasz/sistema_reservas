class ReservaService{
  constructor(ReservaModel){
      this.ReservaModel = ReservaModel;
  }
  /**
   * Lógica para aprovar uma reserva.
     * @param {number} reservaId - O ID da reserva a ser aprovada.
     * @returns {Promise<object>} - A reserva aprovada.
     */
    async aprovar(reservaId){
        // Busca a reserva para garantir que ela existe
        const reservaParaAprovar = await this.ReservaModel.findById(reservaId);
        if (!reservaParaAprovar || reservaParaAprovar.status !== 'pendente') {
            throw new Error("Reserva não encontrada ou já processada.");
        }

        // Verifica conflitos no momento da aprovação
        const hasConflict = await this.ReservaModel.checkAvailability({
            ...reservaParaAprovar,
            reservaIdToExclude: reservaId
        });
        if (hasConflict) {
            throw new Error("Conflito: Este horário já foi preenchido por outra reserva aprovada.");
        }

        const reservaAprovada = await this.ReservaModel.updateStatus(reservaId, 'aprovada');

        // Rejeita automaticamente as outras reservas conflitantes
        if (reservaAprovada) {
            await this.ReservaModel.rejectConflictsFor(reservaAprovada);
        }

        return reservaAprovada;
    }


    async rejeitar(reservaId){
        const reserva = await this.ReservaModel.findById(reservaId);
        if (!reserva) {
          throw new Error("Reserva não encontrada.");
        }
        return this.ReservaModel.updateStatus(reservaId, 'rejeitada');
      }

      //lista todas as reservas
      async listAll(queryParams){
        return this.ReservaModel.findAll(queryParams);
      }

      /**
       * Lista as reservas de um usuário específico.
       */
      async listMine(usuarioCpf, queryParams){
        return this.ReservaModel.findByUser(usuarioCpf, queryParams);
      }
      /**
     * Lógica para solicitar uma nova reserva.
     * @param {object} dadosSolicitacao
     * @param {object} dadosUsuario
     * @returns {Promise<object>}
     * @throws {Error}
     */
    async solicitar(dadosSolicitacao, dadosUsuario){
        
        if (dadosUsuario.tipo === 'admin') {
        const { recurso_id, recurso_tipo, data_inicio, data_fim } = dadosSolicitacao;
        const hasConflict = await this.ReservaModel.checkAvailability({ recurso_id, recurso_tipo, data_inicio, data_fim });
        if (hasConflict) {
            throw new Error("Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado.");
        }
        const novaReserva = await this.ReservaModel.create({ 
            ...dadosSolicitacao, 
            usuario_cpf: dadosUsuario.cpf,
            status: 'aprovada'
        });
        await this.ReservaModel.rejectConflictsFor(novaReserva);
        return novaReserva;
        }

        // Professor Aluno
        const { recurso_id, recurso_tipo, data_inicio, data_fim } = dadosSolicitacao;

        const inicio = new Date(data_inicio);
        const fim = new Date(data_fim);
    
        // Verificar se as datas são válidas após a conversão
        if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
            throw new Error("Formato de data inválido. Use o formato ISO 8601 (ex: 'AAAA-MM-DDTHH:mm:ss-03:00').");
        }

        // Validação se data_fim deve ser posterior a data_inicio
        if (fim <= inicio) {
            throw new Error("Não é possível criar reservas para datas passadas.");
        }

        if (dadosUsuario.tipo === 'aluno' && recurso_tipo !== 'equipamento') {
            throw new Error("Acesso proibido. Alunos podem reservar apenas equipamentos.");
        }
        const hasConflict = await this.ReservaModel.checkAvailability({ recurso_id, recurso_tipo, data_inicio, data_fim });
        if (hasConflict) {
            throw new Error("Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado.");
        }

        const novaReserva = await this.ReservaModel.create({ ...dadosSolicitacao, usuario_cpf: dadosUsuario.cpf });
        return novaReserva;
    }
        /**
       * Cancela uma reserva. Verifica se o usuário tem permissão.
       */
    async cancelar(reservaId, usuarioLogado){
        const reserva = await this.ReservaModel.findById(reservaId);
        if (!reserva) {
            throw new Error("Reserva não encontrada.");
        }
    
        if (reserva.usuario_cpf !== usuarioLogado.cpf && usuarioLogado.tipo !== 'admin') {
            throw new Error("Acesso proibido. Você não tem permissão para cancelar esta reserva.");
        }
        
        return this.ReservaModel.updateStatus(reservaId, 'cancelada');
    }
    async deixarReview(reservaId, dadosReview, usuarioLogado){
        const { nota, comentario } = dadosReview;
        const reserva = await this.ReservaModel.findById(reservaId);
        if (!reserva) {
            throw new Error("Reserva não encontrada.");
        }
        if (reserva.usuario_cpf !== usuarioLogado.cpf) {
            throw new Error("Acesso proibido. Você não tem permissão para avaliar esta reserva.");
        }
        if (new Date() < new Date(reserva.data_fim)) {
            throw new Error("Acesso proibido. A reserva ainda não terminou.");
        }
        if (reserva.nota) {
            throw new Error("Conflito. Esta reserva já foi avaliada.");
        }

        return this.ReservaModel.addReview(reservaId, nota, comentario);
    }
}

export default ReservaService;