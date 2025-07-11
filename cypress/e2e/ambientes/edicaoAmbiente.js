
import { Given, When, Then, Before } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";


Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` })
        .its('status').should('eq', 200);
});

Cypress.Commands.add('login', (email, senha) => {
    cy.request({
        method: 'POST', url: `${API_URL}/api/auth/login`, body: { email, senha },
    }).then((response) => {
        Cypress.env('authToken', response.body.token);
    });
});


Given('eu estou autenticado como um administrador', () => {
    cy.login('admin@email.com', 'senha_segura');
});

//passo para criar nosso ambiente de teste
Given('um ambiente com o identificador {string} e tipo {string} é criado para o teste', (identificacao, tipo) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao, tipo }
    }).then(response => {
        Cypress.env('ambienteDeTesteId', response.body.ambiente.id); 
    });
});

When('eu envio uma requisição PATCH para o ambiente de teste com os novos dados:', (dataTable) => {
    const novosDados = dataTable.hashes()[0];
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteDeTesteId');
    cy.request({
        method: 'PATCH',
        url: `${API_URL}/api/ambientes/${ambienteId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: novosDados,
        failOnStatusCode: false
    }).as('apiResponse');
});

Given('um ambiente com uma reserva futura é criado', () => {
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'POST',
        url: `http://localhost:3000/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao: 'Sala-Com-Reserva-Aprovada', tipo: 'Sala' }
    }).then(ambienteResponse => {
        const ambienteId = ambienteResponse.body.ambiente.id;
        Cypress.env('ambienteDeTesteId', ambienteId); 

        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() + 5); 

        const dataFim = new Date(dataInicio);
        dataFim.setHours(dataFim.getHours() + 2); 

        cy.request({
            method: 'POST',
            url: `http://localhost:3000/api/reservas`, // Endpoint de solicitar reserva
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: {
                recurso_id: ambienteId,
                recurso_tipo: 'ambiente',
                titulo: 'Reserva Aprovada de Teste',
                data_inicio: dataInicio.toISOString(),
                data_fim: dataFim.toISOString()
            }
        }).then(reservaResponse => {
            const reservaId = reservaResponse.body.data.id;
            
            // 3. APROVAMOS a reserva para que o status mude para 'aprovada'
            // Este é o passo que faltava!
            cy.request({
                method: 'PUT',
                url: `http://localhost:3000/api/reservas/${reservaId}/aprovar`,
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).its('status').should('eq', 200);
        });
    });
});



When('eu envio uma requisição DELETE para remover o ambiente de teste', () => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteDeTesteId');

    cy.request({
        method: 'DELETE',
        url: `${API_URL}/api/ambientes/${ambienteId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o ambiente com o identificador {string}', (identificador) => {
    cy.get('@apiResponse').its('body.ambiente.identificacao').should('eq', identificador);
});

Then('o tipo do ambiente na resposta deve ser {string}', (tipo) => {
    cy.get('@apiResponse').its('body.ambiente.tipo').should('eq', tipo);
});
Then('o corpo da resposta deve conter a mensagem {string}', (mensagem) => {
    cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});
