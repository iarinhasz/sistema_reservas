import ReservaModel from '../models/reserva.model.js';

/**
 * Um usuário (aluno ou professor) solicita uma nova reserva.
 */
const solicitar = async (req, res) => {
    try {
        const { recurso_id, recurso_tipo, data_inicio, data_fim, titulo } = req.body;
        const usuario = req.user; // Vem do authMiddleware

        // Validação de entrada
        if (!recurso_id || !recurso_tipo || !data_inicio || !data_fim || !titulo) {
            return res.status(400).json({ message: "Todos os campos (recurso_id, recurso_tipo, data_inicio, data_fim, titulo) são obrigatórios." });
        }

        // Regra de Negócio: Alunos só podem reservar equipamentos.
        if (usuario.tipo === 'aluno' && recurso_tipo === 'ambiente') {
            return res.status(403).json({ message: "Acesso proibido. Alunos podem reservar apenas equipamentos." });
        }

        const novaReserva = await ReservaModel.create({
            usuario_cpf: usuario.cpf,
            recurso_id,
            recurso_tipo,
            data_inicio,
            data_fim,
            titulo
        });

        res.status(201).json({ message: "Solicitação de reserva enviada com sucesso. Aguardando aprovação.", data: novaReserva });

    } catch (error) {
        // Trata o erro de violação da constraint de exclusão (reserva duplicada)
        if (error.code === '23P01') { // exclusion_violation
            return res.status(409).json({ message: "Conflito: Já existe uma reserva para este recurso no horário solicitado." });
        }
        console.error('Erro ao solicitar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};


/**
 * Um administrador aprova uma reserva.
 */
const aprovar = async (req, res) => {
    const { id } = req.params;
    try {
        // Primeiro, verifica se o horário AINDA está disponível antes de aprovar
        const reservaParaAprovar = await ReservaModel.findById(id);
        if (!reservaParaAprovar) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        const hasConflict = await ReservaModel.checkAvailability({
            recurso_id: reservaParaAprovar.recurso_id,
            recurso_tipo: reservaParaAprovar.recurso_tipo,
            data_inicio: reservaParaAprovar.data_inicio,
            data_fim: reservaParaAprovar.data_fim,
            reservaIdToExclude: id
        });

        if (hasConflict) {
            return res.status(409).json({ message: "Conflito: Este horário já foi preenchido por outra reserva aprovada." });
        }

        // Se não há conflitos, aprova a reserva principal
        const reservaAprovada = await ReservaModel.updateStatus(id, 'aprovada');

        // AGORA, A LÓGICA NOVA: Rejeita automaticamente as outras conflitantes
        if (reservaAprovada) {
            const rejectedCount = await ReservaModel.rejectConflictsFor(reservaAprovada);
            console.log(`${rejectedCount} solicitações conflitantes foram rejeitadas automaticamente.`);
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
        res.status(200).json({ message: "Reserva rejeitada com sucesso.", data: reservaRejeitada });
    } catch (error) {
        console.error('Erro ao rejeitar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Um usuário autenticado lista suas próprias reservas.
 */
const listMine = async (req, res) => {
    try {
        const usuario_cpf = req.user.cpf; // Vem do authMiddleware
        const reservas = await ReservaModel.findByUser(usuario_cpf);
        res.status(200).json({ message: "Suas reservas foram listadas com sucesso.", data: reservas });
    } catch (error) {
        console.error('Erro ao listar as próprias reservas:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

/**
 * Cancela uma reserva. Pode ser feito pelo dono da reserva ou por um admin.
 */
const cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.user;

        const reserva = await ReservaModel.findById(id);
        if (!reserva) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        if (reserva.usuario_cpf !== usuario.cpf && usuario.tipo !== 'administrador') {
            return res.status(403).json({ message: "Acesso proibido. Você não tem permissão para cancelar esta reserva." });
        }

        const reservaCancelada = await ReservaModel.updateStatus(id, 'cancelada');
        res.status(200).json({ message: "Reserva cancelada com sucesso.", data: reservaCancelada });
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const listAll = async (req, res) => {
    try {
        const reservas = await ReservaModel.findAll();
        res.status(200).json({ message: "Reservas listadas com sucesso.", data: reservas });
    } catch (error) {
        console.error('Erro ao listar reservas:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

const deixarReview = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nota, comentario } = req.body; 
        const usuarioLogado = req.user; 

        const reserva = await ReservaModel.findById(id);

        if (!reserva) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        if (reserva.usuario_cpf !== usuarioLogado.cpf) {
            return res.status(403).json({ message: "Você não tem permissão para avaliar esta reserva." });
        }

        if (new Date() < new Date(reserva.data_fim)) {
            return res.status(403).json({ message: "Ainda não é possível avaliar. A reserva só termina em " + new Date(reserva.data_fim).toLocaleString('pt-BR') });
        }

        if (reserva.nota !== null) {
            return res.status(409).json({ message: "Esta reserva já foi avaliada e não pode ser alterada." });
        }

        const reservaComReview = await ReservaModel.addReview(id, nota, comentario);

        res.status(200).json({ message: "Review enviado com sucesso!", data: reservaComReview });

    } catch (error) {
        console.error('Erro ao enviar review:', error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
};

export default { solicitar, aprovar, rejeitar, listAll, listMine, cancelar, deixarReview };