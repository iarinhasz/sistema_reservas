import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

// DICA: Mova esta definição para 'cypress/support/commands.js'
Cypress.Commands.add('login', (email, senha) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/auth/login`,
        body: { email, senha }
    }).then((response) => {
        expect(response.status).to.eq(200);
        Cypress.env('authToken', response.body.token);
    });
});

// --- PASSOS DE PREPARAÇÃO (GIVEN) ---

Given('eu estou autenticado como um administrador', () => {
    cy.login('admin@email.com', 'senha_segura'); // Use as credenciais corretas
});

Given('um ambiente com o identificador {string} já existe', (identificador) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            tipo: 'Laboratório',
            identificacao: identificador
        },
        failOnStatusCode: false
    });
});


// --- PASSO DE AÇÃO (WHEN) - ÚNICO E REUTILIZÁVEL ---

When('eu envio uma requisição POST para {string} com o corpo:', (apiUrl, dataTable) => {
    // Pega a primeira linha da tabela da feature e transforma em um objeto
    const body = dataTable.hashes()[0]; 
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'POST',
        url: `${API_URL}${apiUrl}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: body, // Usa o objeto diretamente
        failOnStatusCode: false
    }).as('apiResponse');
});


// --- PASSOS DE VERIFICAÇÃO (THEN) ---

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o ambiente com o identificador {string}', (identificador) => {
    cy.get('@apiResponse').its('body.ambiente.identificacao').should('eq', identificador);
});

Then('o corpo da resposta deve conter a mensagem {string}', (mensagem) => {
    cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});