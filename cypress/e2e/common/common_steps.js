// cypress/e2e/common/common_steps.js
import { Given } from '@badeball/cypress-cucumber-preprocessor';

const API_URL = 'http://localhost:3000';

Given('sou um administrador logado no sistema', () => {
  cy.request({
    method: 'POST',
    url: `${API_URL}/api/auth/login`,
    body: {
      email: 'admin@email.com',
      senha: 'senha_segura'
    }
  }).then(response => {
    expect(response.status).to.eq(200);
    cy.wrap(response.body.token).as('authToken');
    cy.log('Administrador logado e token armazenado.');
  });
});

Given('estou logado como professor', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: {
      email: 'professor@email.com',
      senha: 'senha_segura'
    }
  }).then(response => {
    expect(response.status).to.eq(200);
    cy.wrap(response.body.token).as('authToken');
    cy.log('Professor logado e token armazenado.');
  });
});

Given('eu estou autenticado como um aluno', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: {
      email: 'aluno@email.com',
      senha: 'senha_segura'
    }
  }).then(response => {
    expect(response.status).to.eq(200);
    cy.wrap(response.body.token).as('authToken');
    cy.log('Aluno logado e token armazenado.');
  });
});



Given('o sistema está rodando', () => {
  cy.log('Sistema está rodando — setup inicial.');
});
