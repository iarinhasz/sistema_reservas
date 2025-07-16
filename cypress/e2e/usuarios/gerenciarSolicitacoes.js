import { Before, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import '../common/common_steps';

const API_URL = 'http://localhost:3000';

// Reset apenas em cenários com a tag @reset
Before(() => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/testing/reset`,
    timeout: 30000,
  }).then(response => {
    expect(response.status).to.eq(200);
    cy.log('Banco de dados resetado com sucesso.');
    cy.wait(500); 
  });
});


When('envio uma solicitação de cadastro com nome {string}, cpf {string}, email {string}, senha {string}, tipo {string}', (nome, cpf, email, senha, tipo) => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/usuarios/solicitar`,
    body: { nome, cpf, email, senha, tipo },
    failOnStatusCode: false
  }).as('apiResponse');
});

When('aprovo a solicitação com cpf {string}', (cpf) => {
  cy.get('@authToken').then(token => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/usuarios/${cpf}/aprovar`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

When('rejeito a solicitação com cpf {string} com justificativa {string}', (cpf, justificativa) => {
  cy.get('@authToken').then(token => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/usuarios/${cpf}/rejeitar`,
      headers: { Authorization: `Bearer ${token}` },
      body: { justificativa },
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

When('solicito a lista de solicitações pendentes', () => {
  cy.get('@authToken').then(token => {
    cy.request({
      method: 'GET',
      url: `${API_URL}/api/usuarios/pendentes`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

When('envio uma solicitação para editar o usuário com cpf {string} alterando email para {string}', (cpf, email) => {
  cy.get('@authToken').then(token => {
    cy.request({
      method: 'PATCH',
      url: `${API_URL}/api/usuarios/${cpf}`,
      headers: { Authorization: `Bearer ${token}` },
      body: { email },
      failOnStatusCode: false
    }).as('apiResponse');
  });
});

Then('recebo status {int}', (status) => {
  cy.get('@apiResponse').its('status').should('eq', status);
});

Then('recebo a mensagem {string}', (mensagem) => {
  cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});

Then('a lista contém solicitações pendentes', () => {
  cy.get('@apiResponse').its('body').then(body => {
    cy.log('Resposta completa:', JSON.stringify(body));

    if (Array.isArray(body)) {
      expect(body.length).to.be.greaterThan(0);
    } else if (Array.isArray(body.usuarios)) {
      expect(body.usuarios.length).to.be.greaterThan(0);
    } else {
      throw new Error('Resposta inesperada: nenhum array encontrado');
    }
  });
});
