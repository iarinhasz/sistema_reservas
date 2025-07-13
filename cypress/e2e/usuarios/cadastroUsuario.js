import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import '../common/common_steps'; // <- IMPORTAÇÃO ESSENCIAL

const API_URL = 'http://localhost:3000';

When('envio uma solicitação de cadastro com nome {string}, cpf {string}, email {string}, senha {string}, tipo {string}', 
  (nome, cpf, email, senha, tipo) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/usuarios/solicitar`,
    body: { nome, cpf, email, senha, tipo },
    failOnStatusCode: false
  }).as('apiResponse');
});

Then('recebo status {int}', (status) => {
  cy.get('@apiResponse').its('status').should('eq', status);
});

Then('recebo a mensagem {string}', (mensagem) => {
  cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});
