import { Given } from "cypress-cucumber-preprocessor/steps";

Given("a configuração de steps foi carregada", () => {
  cy.log("SUCESSO! O arquivo de step definition foi encontrado e carregado!");
});