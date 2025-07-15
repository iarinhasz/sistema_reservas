import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";

const API_URL = "http://localhost:3000";

Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` })
    .then(() => {
        cy.login('admin@email.com', 'senha_segura');
    })
    .then(() => {
        const adminTokenFromLogin = Cypress.env('authToken');
        Cypress.env('adminAuthToken', adminTokenFromLogin);
        expect(Cypress.env('adminAuthToken')).to.not.be.undefined;
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/ambientes`,
            headers: { 'Authorization': `Bearer ${Cypress.env('adminAuthToken')}` },
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

Given('um equipamento do tipo {string} com nome {string} existe', (tipo, nome) => {
    const adminAuthToken = Cypress.env('adminAuthToken');
    const ambienteId = Cypress.env('ambienteId');

    cy.request({
        method: 'POST',
        url: `${API_URL}/api/equipamentos`,
        headers: { 'Authorization': `Bearer ${adminAuthToken}` },
        body: {
            nome: nome,
            tipo: tipo,
            quantidade_total: 5,
            ambiente_id: ambienteId
        }
    }).its('status').should('eq', 201);
});

Given('estou autenticado como o usuário {string}', (email) => {
    cy.login(email, 'senha_segura');
});

Given('uma reserva do {string} com id {string} existe no período {string} a {string}', (recursoTipo, recursoId, dataInicio, dataFim) => {
    const adminAuthToken = Cypress.env('adminAuthToken');

    const parsedRecursoId = parseInt(recursoId, 10);
    let createdReservaId;
    cy.request({
        method: 'POST',
        url: `${API_URL}/api/reservas`,
        headers: { 'Authorization': `Bearer ${adminAuthToken}` },
        body: {
            recurso_id: parsedRecursoId,
            recurso_tipo: recursoTipo,
            titulo: `Reserva de Teste Pré-existente para ${recursoTipo} ${recursoId}`,
            data_inicio: dataInicio,
            data_fim: dataFim
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        createdReservaId = response.body.data.id;
        expect(createdReservaId).to.not.be.undefined;
        cy.request({
            method: 'PUT',
            url: `${API_URL}/api/reservas/${createdReservaId}/aprovar`,
            headers: { 'Authorization': `Bearer ${adminAuthToken}` },
        }).then(approveResponse => {
            expect(approveResponse.status).to.eq(200);
            expect(approveResponse.body.data.status).to.eq('aprovada');
        });
    });
});

When('eu envio uma requisição POST para {string} com os dados:', (path, dataTable) => {
    const userAuthToken = Cypress.env('authToken');
    const requestBody = dataTable.hashes()[0];
    requestBody.recurso_id = parseInt(requestBody.recurso_id, 10);

    cy.request({
        method: 'POST',
        url: `${API_URL}${path}`,
        headers: { 'Authorization': `Bearer ${userAuthToken}` },
        body: requestBody,
        failOnStatusCode: false
    }).as('apiResponse');
});

Then('a resposta deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter a propriedade {string} com o valor {string}', (propriedade, valor) => {
    cy.get('@apiResponse').then(response => {
        if (response.body && response.body.hasOwnProperty(propriedade)) {
            expect(response.body[propriedade]).to.eq(valor);
        }
        else if (response.body.data && response.body.data.hasOwnProperty(propriedade)) {
            expect(response.body.data[propriedade]).to.eq(valor);
        }
        else {
            throw new Error(`Propriedade "${propriedade}" não encontrada em response.body.data ou response.body. Propriedades disponíveis: ${JSON.stringify(response.body)}`);
        }
    });
});