import { Before, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const API_URL = 'http://localhost:3000';

Before(() => {
    // Chamamos nossa rota especial de reset
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/testing/reset`,
    }).then(response => {
        // Verificamos se a limpeza foi bem-sucedida
        expect(response.status).to.eq(200);
    });
});


When('envio uma solicitação de cadastro com nome {string}, cpf {string}, email {string}, senha {string}, tipo {string}', 
    (nome, cpf, email, senha, tipo) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/solicitar`,
        body: { nome, cpf, email, senha, tipo },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma solicitação de cadastro sem o campo {string}', (campoOmitido) => {
    const bodyCompleto = {
        nome: "Usuário Teste",
        cpf: "11122233344",
        email: "teste@email.com",
        senha: "senha_forte",
        tipo: "aluno"
    };

    delete bodyCompleto[campoOmitido];

    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/solicitar`,
        body: bodyCompleto,
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('recebo status {int}', (status) => {
    cy.get('@apiResponse').its('status').should('eq', status);
});

Then('recebo a mensagem {string}', (mensagem) => {
    cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});