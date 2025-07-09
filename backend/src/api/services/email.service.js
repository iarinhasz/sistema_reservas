import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false

});

const sendApprovalEmail = async (user) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: user.email,
        subject: 'Seu cadastro foi APROVADO!',
        html: `<h1>Olá, ${user.nome}!</h1>
               <p>Seu cadastro em nosso sistema foi aprovado com sucesso.</p>
               <p>Você já pode fazer login e utilizar a plataforma.</p>
               <p>Atenciosamente,<br>Equipe do Sistema de Reservas</p>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de aprovação enviado para: ${user.email}`);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de aprovação para ${user.email}:`, error);
    }
};

const sendRejectionEmail = async (user, reason) => {
    const mailOptions = {
        from: '"Sistema de Reservas" <noreply@reservas.com>',
        to: user.email,
        subject: 'Informações sobre sua solicitação de cadastro',
        html: `<h1>Olá, ${user.nome}.</h1>
               <p>Sua solicitação de cadastro em nosso sistema foi analisada e, infelizmente, não foi aprovada neste momento.</p>
               <p><strong>Motivo:</strong> ${reason}</p>
               <p>Se você acredita que isso é um erro, por favor, entre em contato.</p>
               <p>Atenciosamente,<br>Equipe do Sistema de Reservas</p>`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de rejeição enviado para: ${user.email}`);
    } catch (error) {
        console.error(`Falha ao enviar e-mail de rejeição para ${user.email}:`, error);
    }
};

export default {
    sendApprovalEmail,
    sendRejectionEmail
};