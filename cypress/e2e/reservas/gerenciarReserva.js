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

        // Cria um ambiente padrão para os testes
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

// criar ambientes adicionais se necessário
Given('um ambiente com identificação {string} e nome {string} existe', (identificacao, nome) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            identificacao,
            nome,
            capacidade: 50,
            tipo: 'Auditório'
        }
    }).its('status').should('eq', 201);
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

// Novo step para criar uma reserva pré-existente para os cenários de gerenciamento
Given('uma reserva pendente com o título {string} foi criada pelo usuário {string}', (titulo, email) => {
   
    return cy.login(email, 'senha_segura').then(() => {
        const userAuthToken = Cypress.env('authToken');
        const requestBody = {
            recurso_id: 1, // Este ID deve corresponder a um equipamento/ambiente que exista
            recurso_tipo: 'equipamento',
            titulo: titulo,
            data_inicio: '2025-11-15T09:00:00-03:00',
            data_fim: '2025-11-15T11:00:00-03:00'
        };

        // Este cy.request agora faz parte da cadeia que o Cypress irá esperar.
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/reservas`,
            headers: { 'Authorization': `Bearer ${userAuthToken}` },
            body: requestBody
        }).then((response) => {
            expect(response.status).to.eq(201);
            // Salva o ID real da reserva criada para ser usado nos próximos steps
            Cypress.env('reservaId', response.body.data.id);
        });
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

// Step para requisições GET (para listagens)
When('eu envio uma requisição GET para {string}', (path) => {
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'GET',
        url: `${API_URL}${path}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

// Step para requisições PUT (usado para aprovar, rejeitar, etc.)
When('eu envio uma requisição PUT para {string}', (path) => {
    const authToken = Cypress.env('authToken');
    const reservaId = Cypress.env('reservaId');

    // Substitui o ID na URL (ex: /1/) pelo ID salvo dinamicamente
    const finalPath = path.replace(/\/(\d+)\//, `/${reservaId}/`);

    cy.request({
        method: 'PUT',
        url: `${API_URL}${finalPath}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição DELETE para {string}', (path) => {
    const authToken = Cypress.env('authToken');
    const reservaId = Cypress.env('reservaId');
    
    // Substitui o ID na URL (ex: /1/) pelo ID salvo dinamicamente
    const finalPath = path.replace(/\/(\d+)\//, `/${reservaId}/`);
    
    cy.request({
        method: 'DELETE',
        url: `${API_URL}${finalPath}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});


Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter a propriedade {string} com o valor {string}', (propriedade, valor) => {
    cy.get('@apiResponse').its('body.data').should('have.property', propriedade, valor);
});

Then('o corpo da resposta deve ser uma lista contendo {int} itens', (count) => {
    cy.get('@apiResponse').its('body.data').should('be.an', 'array').and('have.length', count);
});

Then('o corpo da resposta deve ser uma lista contendo pelo menos {int} itens', (count) => {
    cy.get('@apiResponse').its('body.data').should('be.an', 'array').its('length').should('be.gte', count);
});

Then('a lista na resposta deve conter um item com a propriedade {string} e valor {string}', (propriedade, valor) => {
    cy.get('@apiResponse').its('body.data').then(lista => {
        const itemEncontrado = lista.some(item => item[propriedade] === valor);
        expect(itemEncontrado).to.be.true;
    });
});