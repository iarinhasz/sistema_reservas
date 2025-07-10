import ReservaModel from '../models/reserva.model.js';
// Precisamos do UsuarioModel para buscar o e-mail do solicitante
import UsuarioModel from '../models/usuario.model.js';
// Importamos o serviço de e-mail que sua equipe já está usando
import EmailService from '../services/email.service.js';

/**
 * Um usuário (aluno ou professor) solicita uma nova reserva.
 */
const solicitar = async (req, res) => {
    try {
        const dadosReserva = req.body;
        const usuarioLogado = req.user; // Vem do authMiddleware

        // ... (sua lógica de validação e permissão continua aqui) ...

        const novaReserva = await ReservaModel.create({
            ...dadosReserva,
            usuario_cpf: usuarioLogado.cpf,
        });

        // --- PASSO NOVO: Enviar e-mail de confirmação da solicitação ---
        const solicitante = await UsuarioModel.findByCpf(usuarioLogado.cpf);
        if (solicitante) {
            // Supondo que o EmailService tenha uma função para isso
            await EmailService.sendReservationRequestEmail(solicitante, novaReserva);
        }
        // ----------------------------------------------------------------

        res.status(201).json({ message: "Solicitação de reserva enviada com sucesso. Aguardando aprovação.", data: novaReserva });

    } catch (error) {
        // ... (seu tratamento de erro continua igual) ...
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
        
        // ... (sua lógica de verificação de conflito continua aqui) ...

        const reservaAprovada = await ReservaModel.updateStatus(id, 'aprovada');
        
        if (!reservaAprovada) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        // --- PASSO NOVO: Enviar e-mail de notificação de status ---
        const solicitante = await UsuarioModel.findByCpf(reservaAprovada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendReservationStatusEmail(solicitante, reservaAprovada);
        }
        // -----------------------------------------------------------

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

        // --- PASSO NOVO: Enviar e-mail de notificação de status ---
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
        // ... (sua lógica de permissão para cancelar continua aqui) ...

        const reservaCancelada = await ReservaModel.updateStatus(id, 'cancelada');
        
        if (!reservaCancelada) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        // --- PASSO NOVO: Enviar e-mail de notificação de cancelamento ---
        const solicitante = await UsuarioModel.findByCpf(reservaCancelada.usuario_cpf);
        if (solicitante) {
            await EmailService.sendCancellationEmail(solicitante, reservaCancelada);
        }
        // ----------------------------------------------------------------

        res.status(200).json({ message: "Reserva cancelada com sucesso.", data: reservaCancelada });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

// Suas outras funções (listAll, listMine) continuam iguais.
const listAll = async (req, res) => { /* ... seu código ... */ };
const listMine = async (req, res) => { /* ... seu código ... */ };

export default { solicitar, aprovar, rejeitar, listAll, listMine, cancelar };
