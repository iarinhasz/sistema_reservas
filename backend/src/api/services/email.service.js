// backend/src/api/services/email.service.js
import nodemailer from 'nodemailer';

export default class EmailService {
    transporter; // Declara a propriedade da classe

    constructor() {
        // O construtor é agora responsável por criar e configurar o transporter.
        // Toda a configuração de e-mail fica centralizada aqui.
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'mailhog',
            port: process.env.EMAIL_PORT || 1025,
            secure: false // true para produção com TLS
        });
    }

    async sendApprovalEmail(user) {
        const mailOptions = {
            from: '"Sistema de Reservas" <noreply@reservas.com>',
            to: user.email,
            subject: 'Seu cadastro foi APROVADO!',
            html: `<h1>Olá, ${user.nome}!</h1><p>Seu cadastro foi aprovado. Você já pode fazer login.</p>`
        };
        // Usa o transporter da instância da classe
        await this.transporter.sendMail(mailOptions);
    }

    async sendRejectionEmail(user, reason) {
        const mailOptions = {
            from: '"Sistema de Reservas" <noreply@reservas.com>',
            to: user.email,
            subject: 'Informações sobre sua solicitação de cadastro',
            html: `<h1>Olá, ${user.nome}.</h1><p>Sua solicitação de cadastro não foi aprovada.</p><p><strong>Motivo:</strong> ${reason}</p>`
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendReservationRequestEmail(usuario, reserva) {
        const mailOptions = {
            from: '"Sistema de Reservas" <noreply@reservas.com>',
            to: usuario.email,
            subject: 'Sua Solicitação de Reserva foi Recebida!',
            html: `<h1>Olá, ${usuario.nome}!</h1><p>Recebemos sua solicitação para a reserva: <strong>${reserva.titulo}</strong>. Em breve você receberá uma notificação sobre o status.</p>`
        };
        await this.transporter.sendMail(mailOptions);
    }

    async sendReservationStatusEmail(usuario, reserva) {
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
        await this.transporter.sendMail(mailOptions);
    }

    async sendCancellationEmail(usuario, reserva) {
        const mailOptions = {
            from: '"Sistema de Reservas" <noreply@reservas.com>',
            to: usuario.email,
            subject: 'Confirmação de Cancelamento de Reserva',
            html: `<h1>Olá, ${usuario.nome}!</h1><p>Confirmamos que sua reserva para <strong>${reserva.titulo}</strong> foi cancelada com sucesso.</p>`
        };
        await this.transporter.sendMail(mailOptions);
    }
}