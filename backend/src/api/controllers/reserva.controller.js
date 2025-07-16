import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';
import ReservaService from '../services/reserva.service.js';


const solicitar = async (req, res) => {
     console.log(`[RESERVA CONTROLLER] A requisição chegou na função solicitar.`);
    try {
        const novaReserva = await ReservaService.solicitar(req.body, req.user);

        const solicitante = await UsuarioModel.findByCpf(req.user.cpf);
        if (solicitante) {
            await EmailService.sendReservationRequestEmail(solicitante, novaReserva);
        }
        res.status(201).json({
            message: "Solicitação de reserva enviada com sucesso. Aguardando aprovação.",
            data: novaReserva
        });
    } catch (error) {
        console.error('Erro ao solicitar reserva:', error.message);

        if (error.message.includes("Acesso proibido")) {
            return res.status(403).json({ message: error.message });
        }
        if (error.message.includes("Conflito")) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


const aprovar = async (req, res) => {
    try {
        const { id } = req.params;

        const reservaAprovada = await ReservaService.aprovar(id);

        const solicitante = await UsuarioModel.findByCpf(reservaAprovada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendReservationStatusEmail(solicitante, reservaAprovada);
        }
 
        res.status(200).json({ message: "Reserva aprovada com sucesso.", data: reservaAprovada });
    } catch (error) {
        console.error('Erro ao aprovar reserva:', error.message);

        if (error.message.includes("não encontrada")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("Conflito")) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Um administrador rejeita uma reserva.
 */
const rejeitar = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaRejeitada = await ReservaService.rejeitar(id);
        
        const solicitante = await UsuarioModel.findByCpf(reservaRejeitada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendReservationStatusEmail(solicitante, reservaRejeitada);
        }

        res.status(200).json({ message: "Reserva rejeitada com sucesso.", data: reservaRejeitada });
    } catch (error) {
        if (error.message.includes("não encontrada")) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Cancela uma reserva. Pode ser feito pelo dono da reserva ou por um admin.
 */
const cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaCancelada = await ReservaService.cancelar(id, req.user);

        const solicitante = await UsuarioModel.findByCpf(reservaCancelada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendCancellationEmail(solicitante, reservaCancelada);
        }

        res.status(200).json({ message: "Reserva cancelada com sucesso.", data: reservaCancelada });
    } catch (error) {
        if (error.message.includes("não encontrada")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("Acesso proibido")) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


const deixarReview = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaComReview = await ReservaService.deixarReview(id, req.body, req.user);
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
};

const listAll = async (req, res) => {
    try {
        const todasAsReservas = await ReservaService.listAll(req.query);
        
        res.status(200).json({ data: todasAsReservas });

    } catch (error) {
        console.error('Erro ao listar todas as reservas:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


const listMine = async (req, res) => {
    try {
        const minhasReservas = await ReservaService.listMine(req.user.cpf, req.query);
        res.status(200).json({data: minhasReservas});
    } catch (error) {
        console.error('Erro ao listar minhas reservas:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export default { solicitar, aprovar, rejeitar, cancelar, deixarReview, listAll, listMine };