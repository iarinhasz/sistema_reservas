
import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

Before(() => {
    // 1. A primeira ação é resetar o banco.
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` })
    .then(() => {
        // 2. APÓS o reset, fazemos o login como admin.
        // O comando cy.login() salva o token usando Cypress.env().
        cy.login('admin@email.com', 'senha_segura');
    })
    .then(() => {
        // 3. APÓS o login, o token de admin já existe. Agora podemos pegá-lo.
        const authToken = Cypress.env('authToken');

        // Garante que o token não é undefined antes de prosseguir
        expect(authToken).to.not.be.undefined;

        // 4. Com o token de admin em mãos, criamos o ambiente necessário.
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
        }).its('status').should('eq', 201);
    });
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

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter a propriedade {string} com o valor {string}', (propriedade, valor) => {
    // Adicionamos .data para acessar o objeto aninhado
    cy.get('@apiResponse').its('body.data').should('have.property', propriedade, valor);
});