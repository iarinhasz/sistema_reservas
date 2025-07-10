
import { Given, When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";


Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` })
        .its('status').should('eq', 200);
});

Cypress.Commands.add('login', (email, senha) => {
    cy.request({
        method: 'POST', url: `${API_URL}/api/auth/login`, body: { email, senha },
    }).then((response) => {
        Cypress.env('authToken', response.body.token);
    });
});

// --- PASSOS NOVOS E REUTILIZADOS ---

// Passo reutilizado do outro arquivo
Given('eu estou autenticado como um administrador', () => {
    cy.login('admin@email.com', 'senha_segura');
});

//passo para criar nosso ambiente de teste
Given('um ambiente com o identificador {string} e tipo {string} é criado para o teste', (identificacao, tipo) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao, tipo }
    }).then(response => {
        Cypress.env('ambienteDeTesteId', response.body.ambiente.id); 
    });
});

When('eu envio uma requisição PATCH para o ambiente de teste com os novos dados:', (dataTable) => {
    const novosDados = dataTable.hashes()[0];
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteDeTesteId');
    cy.request({
        method: 'PATCH',
        url: `${API_URL}/api/ambientes/${ambienteId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: novosDados,
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição DELETE para remover o ambiente de teste', () => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteDeTesteId');

    cy.request({
        method: 'DELETE',
        url: `${API_URL}/api/ambientes/${ambienteId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o ambiente com o identificador {string}', (identificador) => {
    cy.get('@apiResponse').its('body.ambiente.identificacao').should('eq', identificador);
});

Then('o tipo do ambiente na resposta deve ser {string}', (tipo) => {
    cy.get('@apiResponse').its('body.ambiente.tipo').should('eq', tipo);
});
Then('o corpo da resposta deve conter a mensagem {string}', (mensagem) => {
    cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});
