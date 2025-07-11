import ReservaModel from '../models/reserva.model.js';
import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';

const solicitar = async (req, res) => {
    try {
        const dadosReserva = req.body;
        const usuarioLogado = req.user;

        const novaReserva = await ReservaModel.create({
            ...dadosReserva,
            usuario_cpf: usuarioLogado.cpf,
        });

        const solicitante = await UsuarioModel.findByCpf(usuarioLogado.cpf);
        if (solicitante) {
            
            await EmailService.sendReservationRequestEmail(solicitante, novaReserva);
        }
        
        res.status(201).json({ message: "Solicitação de reserva enviada com sucesso. Aguardando aprovação.", data: novaReserva });

    } catch (error) {        
        console.error('Erro ao solicitar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Um administrador aprova uma reserva.
 */
const aprovar = async (req, res) => {
    try {
        const { id } = req.params;

        const reservaAprovada = await ReservaModel.updateStatus(id, 'aprovada');
        
        if (!reservaAprovada) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        const solicitante = await UsuarioModel.findByCpf(reservaAprovada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendReservationStatusEmail(solicitante, reservaAprovada);
        }
 
        res.status(200).json({ message: "Reserva aprovada com sucesso.", data: reservaAprovada });
    } catch (error) {
        console.error('Erro ao aprovar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Um administrador rejeita uma reserva.
 */
const rejeitar = async (req, res) => {
    try {
        const { id } = req.params;
        const reservaRejeitada = await ReservaModel.updateStatus(id, 'rejeitada');

        if (!reservaRejeitada) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        const solicitante = await UsuarioModel.findByCpf(reservaRejeitada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendReservationStatusEmail(solicitante, reservaRejeitada);
        }
        // -----------------------------------------------------------

        res.status(200).json({ message: "Reserva rejeitada com sucesso.", data: reservaRejeitada });
    } catch (error) {
        console.error('Erro ao rejeitar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Cancela uma reserva. Pode ser feito pelo dono da reserva ou por um admin.
 */
const cancelar = async (req, res) => {
    try {
        const { id } = req.params;

        const reservaCancelada = await ReservaModel.updateStatus(id, 'cancelada');
        
        if (!reservaCancelada) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        const solicitante = await UsuarioModel.findByCpf(reservaCancelada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendCancellationEmail(solicitante, reservaCancelada);
        }

        res.status(200).json({ message: "Reserva cancelada com sucesso.", data: reservaCancelada });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


const deixarReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nota, comentario } = req.body; 
        const usuarioLogado = req.user; 

        const reserva = await ReservaModel.findById(id);

        // --- LINHA DE DEBUG: Adicione esta linha para "espiar" os dados ---
        console.log('--- DADOS DA RESERVA ANTES DE VALIDAR ---', reserva);
        // --------------------------------------------------------------------

        if (!reserva) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        if (reserva.usuario_cpf !== usuarioLogado.cpf) {
            return res.status(403).json({ message: "Você não tem permissão para avaliar esta reserva." });
        }

        if (new Date() < new Date(reserva.data_fim)) {
            return res.status(403).json({ message: "Ainda não é possível avaliar. A reserva só termina em " + new Date(reserva.data_fim).toLocaleString('pt-BR') });
        }

        if (reserva.nota) { 
            return res.status(409).json({ message: "Esta reserva já foi avaliada e não pode ser alterada." });
        }

        const reservaComReview = await ReservaModel.addReview(id, nota, comentario);

        res.status(200).json({ message: "Review enviado com sucesso!", data: reservaComReview });

    } catch (error) {
        console.error('Erro ao enviar review:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const listAll = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade ainda não implementada." });
};

const listMine = async (req, res) => {
    res.status(501).json({ message: "Funcionalidade ainda não implementada." });
};

export default { solicitar, aprovar, rejeitar, cancelar, deixarReview, listAll, listMine };
