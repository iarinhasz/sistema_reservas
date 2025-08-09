export default class ReservaService {
    constructor(reservaModel, usuarioModel, emailService) {
        this.reservaModel = reservaModel;
        this.usuarioModel = usuarioModel;
        this.emailService = emailService;
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
        const novaReserva = await this.reservaModel.create({ ...dadosSolicitacao, usuario_cpf: dadosUsuario.cpf });

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
        console.log('BACKEND DEBUG: Dados da reserva encontrada no banco:', reserva);
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
        return this.reservaModel.addReview(reservaId, nota, comentario);
    }

    async listMine(usuarioCpf, queryParams) {
        return this.reservaModel.findByUser(usuarioCpf, queryParams);
    }

    async findAllWithReviews() {
        console.log(`\n--- RESERVA SERVICE: Buscando todas as reservas com reviews ---`);
        const reviews = await this.reservaModel.findAllWithReviews();
        if (!reviews) {
            console.log(`--- RESERVA SERVICE: Nenhum review encontrado.`);
            return [];
        }
        console.log(`--- RESERVA SERVICE: Encontrados ${reviews.length} reviews.`);
        return reviews;
    }
}