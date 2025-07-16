import ReservaModel from '../models/reserva.model.js';

const ReservaService = {
  /**
   * Lógica para solicitar uma nova reserva.
   * @param {object} dadosSolicitacao
   * @param {object} dadosUsuario
   * @returns {Promise<object>}
   * @throws {Error}
   */
  solicitar: async (dadosSolicitacao, dadosUsuario) => {
    
    if (dadosUsuario.tipo === 'admin') {
      const { recurso_id, recurso_tipo, data_inicio, data_fim } = dadosSolicitacao;
      const hasConflict = await ReservaModel.checkAvailability({ recurso_id, recurso_tipo, data_inicio, data_fim });
      if (hasConflict) {
        throw new Error("Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado.");
      }
      const novaReserva = await ReservaModel.create({ 
        ...dadosSolicitacao, 
        usuario_cpf: dadosUsuario.cpf,
        status: 'aprovada'
      });
      await ReservaModel.rejectConflictsFor(novaReserva);
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
        throw new Error("A data de fim deve ser posterior à data de início.");
    }

    const agora = new Date();
    agora.setSeconds(0, 0); 
    agora.setMilliseconds(0);
    inicio.setSeconds(0, 0); 
    inicio.setMilliseconds(0);

    // Verificar se data de inicio e depois de agora
    if (inicio < agora) {
        throw new Error("Não é possível criar reservas para datas passadas.");
    }
    if (dadosUsuario.tipo === 'aluno' && recurso_tipo !== 'equipamento') {
      throw new Error("Acesso proibido. Alunos podem reservar apenas equipamentos.");
    }
    const hasConflict = await ReservaModel.checkAvailability({ recurso_id, recurso_tipo, data_inicio, data_fim });
    if (hasConflict) {
      throw new Error("Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado.");
    }

    const novaReserva = await ReservaModel.create({ ...dadosSolicitacao, usuario_cpf: dadosUsuario.cpf });
    return novaReserva;
  },

  /**
   * Lógica para aprovar uma reserva.
   * @param {number} reservaId - O ID da reserva a ser aprovada.
   * @returns {Promise<object>} - A reserva aprovada.
   */
  aprovar: async (reservaId) => {
    // Busca a reserva para garantir que ela existe
    const reservaParaAprovar = await ReservaModel.findById(reservaId);
    if (!reservaParaAprovar || reservaParaAprovar.status !== 'pendente') {
        throw new Error("Reserva não encontrada ou já processada.");
    }

    // Verifica conflitos no momento da aprovação
    const hasConflict = await ReservaModel.checkAvailability({
        ...reservaParaAprovar,
        reservaIdToExclude: reservaId
    });
    if (hasConflict) {
        throw new Error("Conflito: Este horário já foi preenchido por outra reserva aprovada.");
    }

    const reservaAprovada = await ReservaModel.updateStatus(reservaId, 'aprovada');

    // Rejeita automaticamente as outras reservas conflitantes
    if (reservaAprovada) {
        await ReservaModel.rejectConflictsFor(reservaAprovada);
    }

    return reservaAprovada;
  },
  rejeitar: async (reservaId) => {
    const reserva = await ReservaModel.findById(reservaId);
    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }
    return ReservaModel.updateStatus(reservaId, 'rejeitada');
  },

  /**
   * Cancela uma reserva. Verifica se o usuário tem permissão.
   */
  cancelar: async (reservaId, usuarioLogado) => {
    const reserva = await ReservaModel.findById(reservaId);
    if (!reserva) {
      throw new Error("Reserva não encontrada.");
    }

    if (reserva.usuario_cpf !== usuarioLogado.cpf && usuarioLogado.tipo !== 'admin') {
      throw new Error("Acesso proibido. Você não tem permissão para cancelar esta reserva.");
    }
    
    return ReservaModel.updateStatus(reservaId, 'cancelada');
  },

  /**
   * Adiciona uma avaliação (review) a uma reserva.
   */
  deixarReview: async (reservaId, dadosReview, usuarioLogado) => {
    const { nota, comentario } = dadosReview;
    const reserva = await ReservaModel.findById(reservaId);

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

    return ReservaModel.addReview(reservaId, nota, comentario);
  },

  /**
   * Lista todas as reservas (para admins).
   */
  listAll: async (queryParams) => {
    return ReservaModel.findAll(queryParams);
  },

  /**
   * Lista as reservas de um usuário específico.
   */
  listMine: async (usuarioCpf, queryParams) => {
    return ReservaModel.findByUser(usuarioCpf, queryParams);
  }

};

export default ReservaService;