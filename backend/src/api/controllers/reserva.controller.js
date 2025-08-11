export default class ReservaController {
    constructor(reservaService) {
        this.reservaService = reservaService;
    }

    listAll = async (req, res) => {
        try {
            const reservas = await this.reservaService.listAll(req.query);
            // Resposta padronizada que o frontend espera
            res.status(200).json({ data: reservas }); 
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar todas as reservas." });
        }
    }

    solicitar = async (req, res) => {
        try {
            const novaReserva = await this.reservaService.solicitar(req.body, req.user);
            res.status(201).json({ 
                message: "Solicitação de reserva enviada com sucesso.",
                data: novaReserva 
            });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
    
    listMine = async (req, res) => {
        try {
            const minhasReservas = await this.reservaService.listMine(req.user.cpf, req.query);
            res.status(200).json({data: minhasReservas});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar minhas reservas." });
        }
    }

    cancelar = async (req, res) => {
        try {
            const reservaCancelada = await this.reservaService.cancelar(req.params.id, req.user);
            res.status(200).json({ message: "Reserva cancelada com sucesso.", data: reservaCancelada });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
    
    deixarReview = async (req, res) => {
        console.log('BACKEND (Controller): req.body recebido:', req.body);
        console.log('BACKEND (Controller): req.params recebido:', req.params);
        try {
            const { id } = req.params;
            const reservaComReview = await this.reservaService.deixarReview(id, req.body, req.user);
            res.status(200).json({ message: "Review enviado com sucesso!", data: reservaComReview });
        } catch (error) {
            if (error.message.includes("não encontrada")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("Acesso proibido")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("Conflito")) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Erro ao enviar review:', error);
            res.status(500).json({ message: "Erro interno do servidor" });
        }
    }

    getReviewsByRecurso = async (req, res, next) => {
        try {
            const { recurso_tipo, recurso_id } = req.params;
            const reviews = await this.reservaService.findReviewsByRecurso(recurso_id, recurso_tipo);
            res.status(200).json({ data: reviews });
        } catch (error) {
            next(error); // Passa o erro para o próximo middleware de tratamento
        }
    }
    
    criarReservaAdmin = async (req, res) => {
        try {
            const novaReserva = await this.reservaService.criarReservaAdmin(req.body, req.user);
            res.status(201).json({ message: "Reserva criada e aprovada com sucesso.", data: novaReserva });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
    
    aprovar = async (req, res) => {
        try {
            const reservaAprovada = await this.reservaService.aprovar(req.params.id);
            res.status(200).json({ message: "Reserva aprovada com sucesso.", data: reservaAprovada });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
    
    rejeitar = async (req, res) => {
        try {
            const reservaRejeitada = await this.reservaService.rejeitar(req.params.id);
            res.status(200).json({ message: "Reserva rejeitada com sucesso.", data: reservaRejeitada });
        } catch (error) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
    async findAllWithReviews(req, res, next) {
        try {
            const reviews = await this.reservaService.findAllWithReviews() ;
            res.status(200).json({ data: reviews });
        } catch (error) {
            next(error);
        }
    }
}