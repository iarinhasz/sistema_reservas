import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

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
        const authToken = Cypress.env('authToken');
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/ambientes`,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: { identificacao, nome: `Laboratório ${identificacao}`, capacidade: 30, tipo: 'Laboratório' }
        }).then((response) => {
            Cypress.env('ambienteId', response.body.ambiente.id);
        });
    });
});
Given('um equipamento do tipo {string} com nome {string} existe no ambiente {string}', (tipo, nome) => {
    const ambienteId = Cypress.env('ambienteId');
    cy.login('admin@email.com', 'senha_segura').then(() => {
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/equipamentos`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: { nome, tipo, quantidade_total: 1, ambiente_id: ambienteId }
        }).then(response => {
            Cypress.env('equipamentoId', response.body.equipamento.id);
        });
    });
});

/**
 * Este é o passo mais complexo. Ele cria uma reserva e a coloca em diferentes estados
 * dependendo do texto do cenário (TERMINOU ONTEM, TERMINA AMANHÃ, etc.).
 */
Given('uma reserva APROVADA para o {string} feita pelo {string} que {string} existe', (identificacaoAmbiente, emailUsuario, estadoReserva) => {
    const ambienteId = Cypress.env('ambienteId');
    let dataInicio = new Date();
    let dataFim = new Date();

    // Calcula as datas com base no estado descrito no cenário
    if (estadoReserva.includes("TERMINOU ONTEM")) {
        dataInicio.setDate(dataInicio.getDate() - 2); // Começou anteontem
        dataFim.setDate(dataFim.getDate() - 1); // Terminou ontem
    } else if (estadoReserva.includes("TERMINA AMANHÃ")) {
        dataInicio.setDate(dataInicio.getDate()); // Começa hoje
        dataFim.setDate(dataFim.getDate() + 1); // Termina amanhã
    }

    // Primeiro, o usuário da reserva precisa logar para fazer a solicitação
    cy.login(emailUsuario, 'senha_segura').then(() => {
        const userAuthToken = Cypress.env('authToken');

        // Cria a solicitação de reserva
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/reservas/`,
            headers: { 'Authorization': `Bearer ${userAuthToken}` },
            body: { recurso_id: ambienteId, recurso_tipo: 'ambiente', titulo: `Reserva de Teste - ${estadoReserva}`, data_inicio: dataInicio.toISOString(), data_fim: dataFim.toISOString() }
        }).then(reservaResponse => {
            const reservaId = reservaResponse.body.data.id;
            Cypress.env('reservaId', reservaId); // Salva o ID da reserva para os passos 'When'

            // Agora, o admin precisa logar para aprovar a reserva
            cy.login('admin@email.com', 'senha_segura').then(() => {
                const adminAuthToken = Cypress.env('authToken');
                cy.request({
                    method: 'PUT',
                    url: `${API_URL}/api/reservas/${reservaId}/aprovar`,
                    headers: { 'Authorization': `Bearer ${adminAuthToken}` }
                }).then(() => {
                    // Se o cenário pede uma reserva que já tem review, adicionamos o review
                    if (estadoReserva.includes("JÁ POSSUI REVIEW")) {
                        cy.login(emailUsuario, 'senha_segura').then(() => {
                            const finalUserAuthToken = Cypress.env('authToken');
                            cy.request({
                                method: 'POST',
                                url: `${API_URL}/api/reservas/${reservaId}/review`,
                                headers: { 'Authorization': `Bearer ${finalUserAuthToken}` },
                                body: { nota: 3, comentario: "Review pré-existente." }
                            });
                        });
                    }
                });
            });
        });
    });
});

// Este passo agora cria a reserva para o EQUIPAMENTO
// Substitua o passo acima por este:
Given(/^uma reserva APROVADA para o equipamento "([^"]*)" feita pelo "([^"]*)" que (.*) existe$/, (nomeEquipamento, emailUsuario, estadoReserva) => {
    const equipamentoId = Cypress.env('equipamentoId');
    let dataInicio = new Date();
    let dataFim = new Date();

    if (estadoReserva.includes("TERMINOU ONTEM")) {
        dataInicio.setDate(dataInicio.getDate() - 2);
        dataFim.setDate(dataFim.getDate() - 1);
    } else if (estadoReserva.includes("TERMINA AMANHÃ")) {
        dataInicio.setDate(dataInicio.getDate());
        dataFim.setDate(dataFim.getDate() + 1);
    }

    cy.login(emailUsuario, 'senha_segura').then(() => {
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/reservas/`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: { recurso_id: equipamentoId, recurso_tipo: 'equipamento', titulo: `Reserva de Teste`, data_inicio: dataInicio.toISOString(), data_fim: dataFim.toISOString() }
        }).then(reservaResponse => {
            const reservaId = reservaResponse.body.data.id;
            Cypress.env('reservaId', reservaId);

            cy.login('admin@email.com', 'senha_segura').then(() => {
                cy.request({
                    method: 'PUT',
                    url: `${API_URL}/api/reservas/${reservaId}/aprovar`,
                    headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` }
                }).then(() => {
                    if (estadoReserva.includes("JÁ POSSUI REVIEW")) {
                        cy.login(emailUsuario, 'senha_segura').then(() => {
                            cy.request({
                                method: 'POST',
                                url: `${API_URL}/api/reservas/${reservaId}/review`,
                                headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
                                body: { nota: 3, comentario: "Review pré-existente." }
                            });
                        });
                    }
                });
            });
        });
    });
});

Given('estou autenticado como o usuário {string}', (email) => {
    cy.login(email, 'senha_segura');
});


When('eu envio uma requisição POST para avaliar a reserva com nota {string} e comentário {string}', (nota, comentario) => {
    const reservaId = Cypress.env('reservaId');
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${reservaId}/review`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { nota: parseInt(nota), comentario },
        failOnStatusCode: false
    }).as('reviewResponse');
});

When('eu envio uma requisição POST para avaliar a reserva novamente', () => {
    const reservaId = Cypress.env('reservaId');
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${reservaId}/review`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { nota: 5, comentario: "Tentando de novo." },
        failOnStatusCode: false
    }).as('reviewResponse');
});

When('eu envio uma requisição POST para avaliar uma reserva com o ID {string} que não existe', (reservaId) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas/${reservaId}/review`,
        headers: { 'Authorization': `Bearer ${authToken}` },
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