import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = Cypress.env('apiUrl'); 

Before(() => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/testing/reset`
    }).its('status').should('eq', 200);

    cy.login('admin@email.com', 'senha_segura');
});
Given('que eu sou um administrador logado no sistema', () => {
    // O login já foi feito no hook Before(), mas podemos adicionar um passo de UI se preferir.
    // Por enquanto, apenas confirmamos que estamos prontos para prosseguir.
    cy.log('Administrador logado via API.');
});

Given('eu estou na página inicial do administrador', () => {
    cy.visit('/admin'); // Altere para a URL correta da sua página de admin
});

Given('que já existe um ambiente com o identificador {string}', (identificador) => {
    // Usamos uma requisição de API para criar o estado inicial necessário, é mais rápido e confiável que usar a UI.
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
        body: {
            identificacao: identificador,
            tipo: "Laboratórios" // Um tipo padrão para o pré-cadastro
        }
    }).its('status').should('be.oneOf', [201, 409]); // 201 se criou, 409 se já existia de outro passo
});

Given('eu estou na página de cadastro de ambiente', () => {
    cy.visit('/admin/cadastrar-ambiente'); // Ajuste para a URL correta
});

//<Button vira <a>
When('eu clico no botão {string}', (buttonText) => {
    cy.contains(buttonText).click();
});
//diferenciar passo de clicar no botao
When('eu submeto o formulário com o botão {string}', (buttonText) => {
    // Este seletor procura por um elemento com o atributo type="submit"
    cy.get('button[type="submit"]').contains(buttonText).click();
});

When('eu preencho o campo {string} com {string}', (label, text) => {
    // Usamos a label para encontrar o input associado. Isso é robusto.
    // Supondo que seus inputs tenham um 'id' e as labels um 'for' correspondente.
    // Ex: <label for="identificacao-ambiente">Identificador do Ambiente</label> <input id="identificacao-ambiente" />
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).type(text);
    });
});

When('eu deixo o campo {string} em branco', (label) => {
    // Apenas garante que o campo está vazio, não precisa de ação.
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).clear();
    });
});

When('eu seleciono {string} no campo {string}', (option, label) => {
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).select(option);
    });
});

Then('eu vejo a mensagem {string}', (message) => {
    cy.contains(message).should('be.visible');
});

Then('eu sou redirecionado para a página inicial do administrador', () => {
    cy.url().should('include', '/admin'); // Verifica se a URL contém o caminho esperado
});

Then('na seção {string}, eu devo ver {string} sob a categoria {string}', (sectionTitle, ambienteNome, categoriaNome) => {
    // 1. Encontra DIRETAMENTE o título da categoria na página
    cy.contains('h2', categoriaNome)
      // 2. Pega o container de ambientes que vem logo depois dele
        .next()
        // 3. Procura pelo nome do ambiente DENTRO desse container
        .contains(ambienteNome)
        // 4. Garante que ele está visível
        .should('be.visible');
});
Then('na seção {string}, eu devo ver o novo ambiente {string}', (sectionTitle, ambienteNome) => {
    // Versão simplificada para o cenário de trim
    cy.contains('h2', sectionTitle)
      .parent()
      .contains(ambienteNome)
      .should('be.visible');
});

Then('eu devo ver uma mensagem de erro {string}', (errorMessage) => {
    cy.contains(errorMessage).should('be.visible');
});

Then('eu devo continuar na página de cadastro de ambiente', () => {
    cy.url().should('include', '/cadastrar-ambiente');
});

Then('eu devo ver a mensagem de validação {string} associada ao campo {string}', (validationMessage, label) => {
    // Para validação nativa do HTML5
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).then(($input) => {
            // Acessa a mensagem de validação do próprio elemento do input
            expect($input[0].validationMessage).to.eq(validationMessage);
        });
    });
});

Then('o ambiente {string} não deve ser criado', (ambienteNome) => {
    // Para garantir que não foi criado, voltamos para a página principal e verificamos se ele NÃO existe
    cy.visit('/admin');
    cy.contains(ambienteNome).should('not.exist');
});