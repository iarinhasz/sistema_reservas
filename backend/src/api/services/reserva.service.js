import appEmitter from "../../events/appEmitter.js";

export default class ReservaService {
    constructor(reservaModel, usuarioModel, emailService, appEmitter, equipamentoModel) {
        this.reservaModel = reservaModel;
        this.usuarioModel = usuarioModel;
        this.emailService = emailService;
        this.appEmitter = appEmitter;
        this.equipamentoModel = equipamentoModel;
    }

    async aprovar(reservaId) {
        const reservaAprovada = await this.reservaModel.findById(reservaId);
        if (!reservaAprovada || reservaAprovada.status !== 'pendente') {
            throw new Error("Reserva não encontrada ou já processada.");
        }
        
        await this.reservaModel.updateStatus(reservaId, 'aprovada');

        const solicitante = await this.usuarioModel.findByCpf(reservaAprovada.usuario_cpf);
        if (solicitante) {
            await this.emailService.sendReservationStatusEmail(solicitante, reservaAprovada);
        }

        await this.reservaModel.rejectConflictsFor(reservaAprovada);
        return reservaAprovada;
    }

    async rejeitar(reservaId) {
        const reservaRejeitada = await this.reservaModel.updateStatus(reservaId, 'rejeitada');
        if (!reservaRejeitada) {
            throw new Error("Reserva não encontrada.");
        }

        const solicitante = await this.usuarioModel.findByCpf(reservaRejeitada.usuario_cpf);
        if (solicitante) {
            await this.emailService.sendReservationStatusEmail(solicitante, reservaRejeitada);
        }
        return reservaRejeitada;
    }
    
    async listAll(queryParams) {
        return this.reservaModel.findAll(queryParams);
    }
    
    async criarReservaAdmin(dadosSolicitacao, dadosUsuario) {
        const novaReserva = await this.reservaModel.create({ 
            ...dadosSolicitacao, 
            usuario_cpf: dadosUsuario.cpf,
            status: 'aprovada'
        });
        await this.reservaModel.rejectConflictsFor(novaReserva);
        return novaReserva;
    }

    async solicitar(dadosSolicitacao, dadosUsuario) {
        const { recurso_id, recurso_tipo, data_inicio, data_fim } = dadosSolicitacao;

        if (recurso_tipo === 'equipamento') {
            const equipamento = await this.equipamentoModel.findById(recurso_id);
            if (!equipamento) {
                throw new Error("Equipamento não encontrado.");
            }

            const ambienteReservadoCount = await this.reservaModel.countApprovedOverlappingReservations({
                recurso_id: equipamento.ambiente_id,
                recurso_tipo: 'ambiente',
                data_inicio,
                data_fim
            });

            if (ambienteReservadoCount > 0) {
                throw new Error("Não é possível reservar o equipamento, pois o ambiente estará em uso neste horário.");
            }

            const equipamentosJaReservados = await this.reservaModel.countApprovedOverlappingReservations({
                recurso_id,
                recurso_tipo,
                data_inicio,
                data_fim
            });
            
            const equipamentosDisponiveis = equipamento.quantidade_total - equipamentosJaReservados;

            if (equipamentosDisponiveis <= 0) {
                throw new Error("Não há unidades deste equipamento disponíveis para o horário selecionado.");
            }
        }

        const novaReserva = await this.reservaModel.create({ ...dadosSolicitacao, usuario_cpf: dadosUsuario.cpf });

        if (this.appEmitter) {
            this.appEmitter.emit('reserva.solicitada', novaReserva);
        }

        const solicitante = await this.usuarioModel.findByCpf(dadosUsuario.cpf);
        if (solicitante) {
            await this.emailService.sendReservationRequestEmail(solicitante, novaReserva);
        }
        return novaReserva;
    }

    async cancelar(reservaId, usuarioLogado) {
        const reserva = await this.reservaModel.findById(reservaId);
        if (!reserva) { throw new Error("Reserva não encontrada."); }
        if (reserva.usuario_cpf !== usuarioLogado.cpf && usuarioLogado.tipo !== 'admin') {
            throw new Error("Acesso proibido.");
        }
        const reservaCancelada = await this.reservaModel.updateStatus(reservaId, 'cancelada');
        
        const solicitante = await this.usuarioModel.findByCpf(reservaCancelada.usuario_cpf);
        if (solicitante) {
            await this.emailService.sendCancellationEmail(solicitante, reservaCancelada);
        }
        return reservaCancelada;
    }

    async deixarReview(reservaId, dadosReview, usuarioLogado) {
        const { nota, comentario } = dadosReview;
        const reserva = await this.reservaModel.findById(reservaId);
        if (!reserva) {
            throw new Error("Reserva não encontrada.");
        }
        if (reserva.usuario_cpf !== usuarioLogado.cpf) {
            throw new Error("Acesso proibido. Você não tem permissão para avaliar esta reserva.");
        }
        if (new Date() < new Date(reserva.data_fim)) {
            throw new Error("Acesso proibido. A reserva ainda não terminou.");
        }
        if (reserva.nota !== null && reserva.nota !== undefined) {
            throw new Error("Conflito. Esta reserva já foi avaliada.");
        }
        const reservaAtualizada = await this.reservaModel.addReview(reservaId, nota, comentario);

        let ambienteIdParaNotificar = null;
        if (reservaAtualizada.recurso_tipo === 'ambiente') {
            ambienteIdParaNotificar = reservaAtualizada.recurso_id;
        } else if (reservaAtualizada.recurso_tipo === 'equipamento') {
            const equipamento = await this.equipamentoModel.findById(reservaAtualizada.recurso_id);
            if (equipamento) {
                ambienteIdParaNotificar = equipamento.ambiente_id;
            }
        }

        if (ambienteIdParaNotificar && this.appEmitter) {
            this.appEmitter.emit('avaliacao.nova', {
                ambienteId: ambienteIdParaNotificar,
                review: reservaAtualizada
            });
        }

        return reservaAtualizada;
    }

    async listMine(usuarioCpf, queryParams) {
        return this.reservaModel.findByUser(usuarioCpf, queryParams);
    }

    async findAllWithReviews() {
        return this.reservaModel.findAllWithReviews();
    }

    async findReviewsByRecurso(recurso_id, recurso_tipo) {
        return this.reservaModel.findReviewsByRecurso(recurso_id, recurso_tipo);
    }

    async findAllByRecurso(recurso_id, recurso_tipo) {
        return this.reservaModel.findAllByRecurso(recurso_id, recurso_tipo);
    }

    async findReviewsByAmbienteCompleto(ambiente_id) {
        return this.reservaModel.findReviewsByAmbienteCompleto(ambiente_id);
    }
}
