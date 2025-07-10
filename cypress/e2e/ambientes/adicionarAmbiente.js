
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000"; 

Given('eu estou autenticado como um administrador', () => {
  // Usamos nosso comando personalizado para fazer login e salvar o token
    cy.login('admin@email.com', 'senha_hash_segura');
});


// --- Cenário de Sucesso ---
When('eu envio uma requisição POST para "/api/ambientes" com os dados válidos:', (dataTable) => {
    const data = dataTable.hashes()[0];
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
        tipo: data.tipo,
        identificacao: data.identificacao
        },
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o ambiente com o identificador {string}', (identificador) => {
  // No seu controller, a resposta é { message, equipamento }. Ajuste aqui se for diferente.
    cy.get('@apiResponse').its('body.ambiente.identificacao').should('eq', identificador);
});


// --- Cenário de Identificador Vazio ---
When('eu envio uma requisição POST para "/api/ambientes" com o identificador vazio', () => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
        tipo: "Sala",
        identificacao: "" // Enviando vazio
        },
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('o corpo da resposta deve conter a mensagem de erro sobre campos obrigatórios', () => {
  // Ajuste a mensagem para ser exatamente igual à retornada pela sua API
    cy.get('@apiResponse').its('body.message').should('include', 'Identificador obrigatório');
});


// --- Cenário de Identificador Duplicado ---
Given('um ambiente com o identificador {string} já existe', (identificador) => {
    const authToken = Cypress.env('authToken');
    // Criamos o ambiente uma vez para garantir que ele exista
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
        tipo: 'Laboratório',
        identificacao: identificador
        }
    });
});

Then('o corpo da resposta deve conter a mensagem {string}', (errorMessage) => {
    cy.get('@apiResponse').its('body.message').should('eq', errorMessage);
});