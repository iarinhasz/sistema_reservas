import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` });
    cy.login('admin@email.com', 'senha_segura');
});

Given('uma solicitação de cadastro para o usuário {string} com CPF {string} e email {string} existe', (nome, cpf, email) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/solicitar`,
        body: {
            nome: nome,
            cpf: cpf,
            email: email,
            senha: 'senha_padrao_pendente',
            tipo: email.includes('professor') ? 'professor' : 'aluno'
        }
    }).its('status').should('eq', 201);
});
Given('estou autenticado como o usuário {string}', (email) => {
    cy.login(email, 'senha_segura');
});

When('eu envio uma requisição GET para {string}', (path) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'GET',
        url: `${API_URL}${path}`,
        headers: { 'Authorization': `Bearer ${authToken}` }
    }).as('adminResponse');
});

When('eu envio uma requisição POST para aprovar o cadastro com CPF {string}', (cpf) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/${cpf}/aprovar`,
        headers: { 'Authorization': `Bearer ${authToken}` }
    }).as('adminResponse');
});

When('eu envio uma requisição POST para rejeitar o cadastro com CPF {string} com a justificativa {string}', (cpf, justificativa) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/${cpf}/rejeitar`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { justificativa: justificativa }
    }).as('adminResponse');
});

When('eu envio uma requisição POST para rejeitar o cadastro com CPF {string} sem justificativa', (cpf) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/usuarios/${cpf}/rejeitar`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {},
        failOnStatusCode: false
    }).as('adminResponse');
});


Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@adminResponse').its('status').should('eq', statusCode);
});

Then('recebo a mensagem {string}', (mensagem) => {
    cy.get('@adminResponse').its('body.message').should('eq', mensagem);
});

Then('o corpo da resposta deve ser uma lista contendo {int} usuários', (quantidade) => {
    cy.get('@adminResponse').its('body').then((body) => {
        
        const listaDeUsuarios = body.usuarios;

        // Agora sim, as verificações são feitas na lista correta
        expect(listaDeUsuarios).to.be.an('array');
        expect(listaDeUsuarios).to.have.lengthOf(quantidade);
    });
});
Then('a lista de usuários deve conter o email {string}', (email) => {
    cy.get('@adminResponse').its('body').then((body) => {
        const listaDeUsuarios = Array.isArray(body) ? body : body.usuarios;

        expect(listaDeUsuarios).to.be.an('array'); 

        const emails = listaDeUsuarios.map(u => u.email);
        expect(emails).to.include(email);
    });
});

Then('a lista de usuários deve conter o email {string}', (email) => {
    cy.get('@adminResponse').its('body').then((body) => {
        const listaDeUsuarios = body.usuarios;

        const emails = listaDeUsuarios.map(u => u.email);
        expect(emails).to.include(email);
    });
});