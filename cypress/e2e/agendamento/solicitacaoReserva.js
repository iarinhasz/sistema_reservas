
import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` })
    .then(() => {
        cy.login('admin@email.com', 'senha_segura');
    })
    .then(() => {
        const authToken = Cypress.env('authToken');

        expect(authToken).to.not.be.undefined;

        cy.request({
            method: 'POST',
            url: `${API_URL}/api/ambientes`,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: {
                identificacao: 'LAB-01',
                nome: 'Laboratório de Teste 01',
                capacidade: 30,
                tipo: 'Laboratório'
            }
        }).then(response => {
        Cypress.env('ambienteId', response.body.ambiente.id);
    });
    });
});

Given('um equipamento do tipo {string} com nome {string} existe', (tipo, nome) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');

    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            nome: nome,
            tipo: tipo,
            quantidade_total: 5,
            ambiente_id: ambienteId
        }
    }).its('status').should('eq', 201);
});

Given('estou autenticado como o usuário {string}', (email) => {
    cy.login(email, 'senha_segura');
});

When('eu envio uma requisição POST para {string} com os dados:', (path, dataTable) => {
    const authToken = Cypress.env('authToken');
    const requestBody = dataTable.hashes()[0];
    requestBody.recurso_id = parseInt(requestBody.recurso_id, 10);

    cy.request({
        method: 'POST',
        url: `${API_URL}${path}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: requestBody,
        failOnStatusCode: false
    }).as('apiResponse');
});
4
Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter a propriedade {string} com o valor {string}', (propriedade, valor) => {
    cy.get('@apiResponse').its('body.data').should('have.property', propriedade, valor);
});