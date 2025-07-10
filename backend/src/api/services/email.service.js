
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'mailhog',
    port: process.env.EMAIL_PORT || 1025,
    secure: false
});

const sendApprovalEmail = async (user) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: user.email,
        subject: 'Seu cadastro foi APROVADO!',
        html: `<h1>Olá, ${user.nome}!</h1><p>Seu cadastro foi aprovado. Você já pode fazer login.</p>`
    };
    await transporter.sendMail(mailOptions);
};

const sendRejectionEmail = async (user, reason) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: user.email,
        subject: 'Informações sobre sua solicitação de cadastro',
        html: `<h1>Olá, ${user.nome}.</h1><p>Sua solicitação de cadastro não foi aprovada.</p><p><strong>Motivo:</strong> ${reason}</p>`
    };
    await transporter.sendMail(mailOptions);
};


const sendReservationRequestEmail = async (usuario, reserva) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: 'Sua Solicitação de Reserva foi Recebida!',
        html: `<h1>Olá, ${usuario.nome}!</h1><p>Recebemos sua solicitação para a reserva: <strong>${reserva.titulo}</strong>. Em breve você receberá uma notificação sobre o status.</p>`
    };
    await transporter.sendMail(mailOptions);
};

const sendReservationStatusEmail = async (usuario, reserva) => {
    const isApproved = reserva.status === 'aprovada';
    const subject = isApproved ? 'Sua Reserva foi APROVADA!' : 'Sua Solicitação de Reserva foi Rejeitada';
    const body = isApproved
        ? `<p>Sua solicitação para a reserva <strong>${reserva.titulo}</strong> foi aprovada.</p>`
        : `<p>Sua solicitação para a reserva <strong>${reserva.titulo}</strong> foi rejeitada.</p>`;
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: subject,
        html: `<h1>Olá, ${usuario.nome}!</h1>${body}`
    };
    await transporter.sendMail(mailOptions);
};

const sendCancellationEmail = async (usuario, reserva) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: usuario.email,
        subject: 'Confirmação de Cancelamento de Reserva',
        html: `<h1>Olá, ${usuario.nome}!</h1><p>Confirmamos que sua reserva para <strong>${reserva.titulo}</strong> foi cancelada com sucesso.</p>`
    };
    await transporter.sendMail(mailOptions);
};

// Exporta todas as funções
export default {
    sendApprovalEmail,
    sendRejectionEmail,
    sendReservationRequestEmail,
    sendReservationStatusEmail,
    sendCancellationEmail,
};