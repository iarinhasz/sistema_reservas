// cypress/e2e/equipamentos/gerenciar_equipamentos.js

import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` });
});

Given('eu estou autenticado como um administrador', () => {
    cy.login('admin@email.com', 'senha_segura');
});



Given('um ambiente com o identificador {string} é criado', (identificador) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao: identificador, tipo: 'Laboratório' }
    }).then(response => {
        expect(response.status).to.eq(201);
        Cypress.env('ambienteId', response.body.ambiente.id);
    });
});

Given('um equipamento com nome {string} é criado no ambiente de teste', (nome) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            nome: nome,
            quantidade_total: 1,
            ambiente_id: ambienteId
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        Cypress.env('equipamentoId', response.body.equipamento.id);
    });
});

Given('um equipamento com nome {string} e quantidade {string} é criado no ambiente de teste', (nome, quantidade) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            nome: nome,
            quantidade_total: parseInt(quantidade, 10),
            ambiente_id: ambienteId
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        Cypress.env('equipamentoId', response.body.equipamento.id);
    });
});

Given('um equipamento com uma reserva futura é criado', () => {
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'POST',
        url: `http://localhost:3000/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao: 'Lab-Para-Equip-Reservado', tipo: 'Laboratório' }
    }).then(ambienteResponse => {
        const ambienteId = ambienteResponse.body.ambiente.id;

        cy.request({
            method: 'POST',
            url: `http://localhost:3000/api/equipamentos`,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: { nome: 'Projetor Reservado', quantidade_total: 1, ambiente_id: ambienteId }
        }).then(equipamentoResponse => {
            const equipamentoId = equipamentoResponse.body.equipamento.id;
            Cypress.env('equipamentoId', equipamentoId); // Salva o ID para o passo DELETE

            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() + 10); 
            const dataFim = new Date(dataInicio);
            dataFim.setHours(dataFim.getHours() + 1);

            cy.request({
                method: 'POST',
                url: `http://localhost:3000/api/reservas/`,
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: {
                    recurso_id: equipamentoId,
                    recurso_tipo: 'equipamento', 
                    titulo: 'Reserva de Equipamento de Teste',
                    data_inicio: dataInicio.toISOString(),
                    data_fim: dataFim.toISOString()
                }
            }).then(reservaResponse => {
                const reservaId = reservaResponse.body.data.id;

                //APROVAR a reserva para criar o bloqueio
                cy.request({
                    method: 'PUT',
                    url: `http://localhost:3000/api/reservas/${reservaId}/aprovar`,
                    headers: { 'Authorization': `Bearer ${authToken}` }
                }).its('status').should('eq', 200);
            });
        });
    });
});

When('eu envio uma requisição POST para {string} para adicionar o equipamento {string} ao ambiente de teste', (apiUrl, nomeEquipamento) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            nome: nomeEquipamento,
            quantidade_total: 5,
            ambiente_id: ambienteId
        },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição POST para {string} com o corpo faltando um campo obrigatório', (apiUrl) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: {
            nome: "Equipamento Sem Quantidade",
            ambiente_id: ambienteId
            // O campo 'quantidade_total' está faltando de propósito
            },
        failOnStatusCode: false
    }).as('apiResponse');
});


When('eu envio uma requisição PATCH para o equipamento de teste com os novos dados:', (dataTable) => {
    const novosDados = dataTable.hashes()[0];
    const authToken = Cypress.env('authToken');
    const equipamentoId = Cypress.env('equipamentoId'); // Pega o ID salvo no passo Given
    cy.request({
        method: 'PATCH',
        url: `${API_URL}/api/equipamentos/${equipamentoId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: novosDados,
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição DELETE para remover o equipamento de teste', () => {
    const authToken = Cypress.env('authToken');
    const equipamentoId = Cypress.env('equipamentoId');
    cy.request({
        method: 'DELETE',
        url: `${API_URL}/api/equipamentos/${equipamentoId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('a resposta da requisição deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o equipamento com o nome {string}', (nome) => {
    cy.get('@apiResponse').its('body.equipamento.nome').should('eq', nome);
});

Then('o corpo da resposta deve conter a mensagem {string}', (mensagem) => {
    cy.get('@apiResponse').its('body.message').should('eq', mensagem);
});

Then('a resposta da requisição de equipamento deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});