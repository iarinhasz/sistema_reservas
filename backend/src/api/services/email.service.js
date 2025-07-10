/**
 * Envia um e-mail confirmando o recebimento da solicitação de reserva.
 */
const sendReservationRequestEmail = async (usuario, reserva) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: 'Sua Solicitação de Reserva foi Recebida!',
        html: `
            <h1>Olá, ${usuario.nome}!</h1>
            <p>Recebemos sua solicitação para a reserva: <strong>${reserva.titulo}</strong>.</p>
            <p>Datas: de ${new Date(reserva.data_inicio).toLocaleString('pt-BR')} até ${new Date(reserva.data_fim).toLocaleString('pt-BR')}.</p>
            <p>Em breve você receberá uma notificação sobre a aprovação ou rejeição.</p>
            <p>Obrigado!</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de solicitação de reserva enviado para: ${usuario.email}`);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de solicitação de reserva para ${usuario.email}:`, error);
    }
};

/**
 * Envia um e-mail informando o novo status de uma reserva (aprovada ou rejeitada).
 */
const sendReservationStatusEmail = async (usuario, reserva) => {
    const isApproved = reserva.status === 'aprovada';
    const subject = isApproved ? 'Sua Reserva foi APROVADA!' : 'Sua Solicitação de Reserva foi Rejeitada';
    const body = isApproved
        ? `<p>Sua solicitação para a reserva <strong>${reserva.titulo}</strong> foi aprovada. O recurso já está garantido para você.</p>`
        : `<p>Lamentamos informar que sua solicitação para a reserva <strong>${reserva.titulo}</strong> foi rejeitada.</p>`;

    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: subject,
        html: `<h1>Olá, ${usuario.nome}!</h1>${body}<p>Obrigado!</p>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de status de reserva enviado para: ${usuario.email}`);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de status de reserva para ${usuario.email}:`, error);
    }
};

/**
 * Envia um e-mail confirmando o cancelamento de uma reserva.
 */
const sendCancellationEmail = async (usuario, reserva) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: 'Confirmação de Cancelamento de Reserva',
        html: `
            <h1>Olá, ${usuario.nome}!</h1>
            <p>Confirmamos que sua reserva para <strong>${reserva.titulo}</strong> foi cancelada com sucesso.</p>
            <p>Obrigado!</p>
        `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de cancelamento de reserva enviado para: ${usuario.email}`);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de cancelamento de reserva para ${usuario.email}:`, error);
    }
};


// Exporta TODAS as funções para que possam ser usadas em outros lugares do sistema.
export default {
    sendApprovalEmail,
    sendRejectionEmail,
    sendReservationRequestEmail,
    sendReservationStatusEmail,
    sendCancellationEmail,
};