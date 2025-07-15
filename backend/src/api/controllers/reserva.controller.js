import ReservaModel from '../models/reserva.model.js';
import UsuarioModel from '../models/usuario.model.js';
import EmailService from '../services/email.service.js';

const solicitar = async (req, res) => {
    try {
        const dadosReserva = req.body;
        const usuarioLogado = req.user;

        if (usuarioLogado.tipo === 'admin') {
            const novaReserva = await ReservaModel.create({
                ...dadosReserva,
                usuario_cpf: usuarioLogado.cpf,
                status: 'aprovada', 
            });

            
            await ReservaModel.rejectConflictsFor(novaReserva);

            res.status(201).json({ message: "Reserva criada e aprovada com sucesso.", data: novaReserva });

        } else {
            const novaReserva = await ReservaModel.create({
                ...dadosReserva,
                usuario_cpf: usuarioLogado.cpf,
                
            });
            const solicitante = await UsuarioModel.findByCpf(usuarioLogado.cpf);
            if (solicitante) {
                await EmailService.sendReservationRequestEmail(solicitante, novaReserva);
            }
            
            res.status(201).json({ message: "Solicitação de reserva enviada com sucesso. Aguardando aprovação.", data: novaReserva });
        }

    } catch (error) {        
        console.error('Erro ao criar/solicitar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


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


const listAll = async (req, res) => {
    try {
        const todasAsReservas = await ReservaModel.findAll();
        res.status(200).json({ data: todasAsReservas });
    } catch (error) {
        console.error('Erro ao listar todas as reservas:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


const listMine = async (req, res) => {
    try {
        const { cpf } = req.user;
        const minhasReservas = await ReservaModel.findByUser(cpf);
        res.status(200).json({ data: minhasReservas });
    } catch (error) {
        console.error('Erro ao listar as reservas do usuário:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export default { solicitar, aprovar, rejeitar, listAll, listMine, cancelar };
