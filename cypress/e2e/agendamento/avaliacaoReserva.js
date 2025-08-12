
import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

const criarAprovarReserva = (recursoTipo, recursoId, emailUsuario, estadoReserva) => {
    let dataInicio = new Date();
    let dataFim = new Date();

    if (estadoReserva.includes("TERMINOU ONTEM")) {
        dataInicio.setDate(dataInicio.getDate() - 2);
        dataFim.setDate(dataFim.getDate() - 1);
    } else if (estadoReserva.includes("TERMINA AMANHÃ")) {
        dataInicio.setDate(dataInicio.getDate());
        dataFim.setDate(dataFim.getDate() + 1);
    }

    const dadosReserva = {
        recurso_id: recursoId,
        recurso_tipo: recursoTipo,
        titulo: `Reserva de Teste - ${estadoReserva}`,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString()
    };

    return cy.login(emailUsuario, 'senha_segura').then(() => {
        return cy.request({
            method: 'POST',
            url: `${API_URL}/api/reservas`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: dadosReserva
        }).then(reservaResponse => {
            const reservaId = reservaResponse.body.data.id;
            Cypress.env('reservaId', reservaId);
            return cy.login('admin@email.com', 'senha_segura').then(() => {
                return cy.request({
                    method: 'PUT',
                    url: `${API_URL}/api/reservas/${reservaId}/aprovar`,
                    headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` }
                });
            });
        });
    });
};


Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` });
});

Given('o usuário {string} do tipo {string} existe e está ativo', (email, tipo) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/testing/usuario-ativo`,
        body: { email, tipo, nome: 'Usuario de Teste', cpf: Math.random().toString().slice(2,13), senha: 'senha_segura' }
    }).its('status').should('be.oneOf', [200, 201]);
});

Given('um ambiente com identificacao {string} existe', (identificacao) => {
    cy.login('admin@email.com', 'senha_segura').then(() => {
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/ambientes`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: { identificacao, nome: `Laboratório ${identificacao}`, capacidade: 30, tipo: 'Laboratório' }
        }).then((response) => Cypress.env('ambienteId', response.body.ambiente.id));
    });
});

Given('um equipamento do tipo {string} com nome {string} existe no ambiente {string}', (tipo, nome, idAmbiente) => {
    cy.login('admin@email.com', 'senha_segura').then(() => {
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/equipamentos`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: { nome, tipo, quantidade_total: 1, ambiente_id: Cypress.env('ambienteId') }
        }).then(response => Cypress.env('equipamentoId', response.body.equipamento.id));
    });
});

// Usando dois steps separados e sem ambiguidade para equipamento e ambiente
Given(/^uma reserva APROVADA para o equipamento "([^"]*)" feita pelo "([^"]*)" que (.*) existe$/, (nomeEquipamento, emailUsuario, estadoReserva) => {
    const equipamentoId = Cypress.env('equipamentoId');
    criarAprovarReserva('equipamento', equipamentoId, emailUsuario, estadoReserva).then(() => {
        if (estadoReserva.includes("JÁ POSSUI REVIEW")) {
            cy.login(emailUsuario, 'senha_segura').then(() => {
                cy.request({
                    method: 'POST',
                    url: `${API_URL}/api/reservas/${Cypress.env('reservaId')}/review`,
                    headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
                    body: { nota: 3, comentario: "Review pré-existente." }
                });
            });
        }
    });
});

Given(/^uma reserva APROVADA para o "([^"]*)" feita pelo "([^"]*)" que (.*) existe$/, (identificacaoAmbiente, emailUsuario, estadoReserva) => {
    const ambienteId = Cypress.env('ambienteId');
    criarAprovarReserva('ambiente', ambienteId, emailUsuario, estadoReserva).then(() => {
        if (estadoReserva.includes("JÁ POSSUI REVIEW")) {
            cy.login(emailUsuario, 'senha_segura').then(() => {
                cy.request({
                    method: 'POST',
                    url: `${API_URL}/api/reservas/${Cypress.env('reservaId')}/review`,
                    headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
                    body: { nota: 3, comentario: "Review pré-existente." }
                });
            });
        }
    });
});

Given('estou autenticado como o usuário {string}', (email) => {
    cy.login(email, 'senha_segura');
});

When('eu envio uma requisição POST para avaliar a reserva com nota {string} e comentário {string}', (nota, comentario) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${Cypress.env('reservaId')}/review`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
        body: { nota: parseInt(nota), comentario },
        failOnStatusCode: false
    }).as('reviewResponse');
});

When('eu envio uma requisição POST para avaliar a reserva novamente', () => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${Cypress.env('reservaId')}/review`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
        body: { nota: 5, comentario: "Tentando de novo." },
        failOnStatusCode: false
    }).as('reviewResponse');
});

When('eu envio uma requisição POST para avaliar uma reserva com o ID {string} que não existe', (reservaId) => {
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${reservaId}/review`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
        body: { nota: 5, comentario: "Para uma reserva fantasma." },
        failOnStatusCode: false
    }).as('reviewResponse');
});

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@reviewResponse').its('status').should('eq', statusCode);
});

Then('recebo a mensagem {string}', (mensagem) => {
    cy.get('@reviewResponse').its('body.message').should('eq', mensagem);
});

Then('a resposta deve conter a mensagem {string}', (mensagem) => {
    cy.get('@reviewResponse').its('body.message').should('include', mensagem);
});