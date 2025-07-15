// cypress/e2e/common/common_steps.js

//import { Given } from "cypress-cucumber-preprocessor/steps"; // Instalações Linux 
import { Given } from '@badeball/cypress-cucumber-preprocessor'; // Só roda no sistema MacOS (Felipe Manoel - lipmanoel)


Given("sou um administrador logado no sistema", () => {
  // Por enquanto, vamos apenas registrar no log para ver o teste passar.
  // No futuro, aqui entraria a lógica de login real.
  cy.log("Executando o passo de login do administrador...");



  // Exemplo de como seria a implementação real no futuro:
  // cy.visit('/login');
  // cy.get('input[name="email"]').type('admin@email.com');
  // cy.get('input[name="password"]').type('senhaForte');
  // cy.get('button[type="submit"]').click();
  // cy.url().should('include', '/dashboard');
});

Given('o sistema está rodando', () => {
  cy.log('Sistema está rodando — setup inicial.');
});