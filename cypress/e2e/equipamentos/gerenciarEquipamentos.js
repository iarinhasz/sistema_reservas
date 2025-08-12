// cypress/e2e/equipamentos/gerenciar_equipamentos.js

import { Before, Given, Then, When } from "@badeball/cypress-cucumber-preprocessor";
const API_URL = "http://localhost:3000";

Before(() => {
    cy.request({ method: 'POST', url: `${API_URL}/api/testing/reset` });
});

Given('eu estou autenticado como {string}', (perfil) => {
    
    const users = {
        admin: { email: 'admin@email.com', senha: 'senha_segura' },
        aluno: { email: 'aluno@email.com', senha: 'senha_segura' }
    };

    const credentials = users[perfil.toLowerCase()];

    cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: credentials,
        failOnStatusCode: false
    }).then((response) => {
        expect(response.status).to.eq(200);
        Cypress.env('authToken', response.body.token);
    });
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

Given('um equipamento com nome {string} já existe no ambiente de teste', (nome) => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');

    Cypress.env('nomeEquipamentoDuplicado', nome);

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
            body: { nome: 'Projetor Reserva', quantidade_total: 1, ambiente_id: ambienteId }
        }).then(equipamentoResponse => {
            const equipamentoId = equipamentoResponse.body.equipamento.id;
            Cypress.env('equipamentoId', equipamentoId); // Salva o ID para o passo DELETE

            //debug
            cy.log('ID do Equipamento Criado:', equipamentoId);

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
            }).its('status').should('eq', 201);
        });
    });
});

Given('o ambiente {string} tem {int} equipamentos cadastrados', (nomeAmbiente, numEquipamentos) => {
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'POST',
        url: `${API_URL}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { identificacao: nomeAmbiente, tipo: 'Laboratório' },
        failOnStatusCode: false
    }).then(ambienteResponse => {

        return cy.request({
            method: 'GET',
            url: `${API_URL}/api/ambientes`,
            headers: { 'Authorization': `Bearer ${authToken}` }
        }).then(getResp => {
            const ambiente = getResp.body.find(a => a.identificacao === nomeAmbiente);
            
            if (!ambiente) {
                throw new Error(`Ambiente de teste '${nomeAmbiente}' não foi encontrado após a tentativa de criação/busca.`);
            }
            // Retornamos o ID para o próximo .then()
            return cy.wrap(ambiente.id);
        });
    }).then(ambienteId => {
        for (let i = 1; i <= numEquipamentos; i++) {
            cy.request({
                method: 'POST',
                url: `${API_URL}/api/equipamentos`,
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: {
                    nome: `Equipamento de Teste ${i} no ${nomeAmbiente}`,
                    quantidade_total: 1,
                    ambiente_id: ambienteId
                }
            }).its('status').should('eq', 201);
        }
    });
});

Given('um equipamento é reservado por um "aluno" e aprovado por um "admin"', () => {
    let adminAuthToken;
    let alunoAuthToken;
    let equipamentoId;

    const users = {
        admin: { email: "admin@email.com", senha: "senha_segura" },
        aluno: { email: "aluno@email.com", senha: "senha_segura" }
    };

    cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: users.admin
    }).then(response => {
        adminAuthToken = response.body.token;

        // 2. Login como Aluno para obter o token
        return cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/auth/login',
            body: users.aluno
        });
    }).then(response => {
        alunoAuthToken = response.body.token;

        // 3. Como Admin, criar o ambiente e o equipamento
        return cy.request({
            method: 'POST',
            url: `http://localhost:3000/api/ambientes`,
            headers: { 'Authorization': `Bearer ${adminAuthToken}` },
            body: { identificacao: 'Lab-Reservado-Por-Aluno', tipo: 'Laboratório' }
        });
    }).then(ambienteResponse => {
        const ambienteId = ambienteResponse.body.ambiente.id;
        return cy.request({
            method: 'POST',
            url: `http://localhost:3000/api/equipamentos`,
            headers: { 'Authorization': `Bearer ${adminAuthToken}` },
            body: { nome: 'Projetor Para Aluno', quantidade_total: 1, ambiente_id: ambienteId }
        });
    }).then(equipamentoResponse => {
        equipamentoId = equipamentoResponse.body.equipamento.id;
        Cypress.env('equipamentoId', equipamentoId);

        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() + 15);
        const dataFim = new Date(dataInicio);
        dataFim.setHours(dataFim.getHours() + 1);

        // 4. Como Aluno, criar a reserva (ela ficará pendente)
        return cy.request({
            method: 'POST',
            url: `http://localhost:3000/api/reservas/`,
            headers: { 'Authorization': `Bearer ${alunoAuthToken}` },
            body: {
                recurso_id: equipamentoId,
                recurso_tipo: 'equipamento',
                titulo: 'Reserva feita por Aluno',
                data_inicio: dataInicio.toISOString(),
                data_fim: dataFim.toISOString()
            }
        });
    }).then(reservaResponse => {
        const reservaId = reservaResponse.body.data.id;

        // 5. Como Admin, aprovar a reserva do aluno
        return cy.request({
            method: 'PUT',
            url: `http://localhost:3000/api/reservas/${reservaId}/aprovar`,
            headers: { 'Authorization': `Bearer ${adminAuthToken}` }
        });
    }).its('status').should('eq', 200);
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
            },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição POST com o mesmo nome', () => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');
    const equipamentoId = Cypress.env('equipamentoId');
    cy.request({
        method: 'GET',
        url: `${API_URL}/api/equipamentos/${equipamentoId}`,
        headers: { Authorization: `Bearer ${authToken}` }
    }).then(getRes => {
        const existente = getRes.body;
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/equipamentos`,
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: {
                nome: existente.nome,
                quantidade_total: existente.quantidade_total,
                ambiente_id: existente.ambiente_id
            },
        failOnStatusCode: false
    }).as('apiResponse'); });
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

When('eu envio uma requisição PATCH sem fornecer ID', () => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'PATCH',
        url: `${API_URL}/api/equipamentos/`, // sem ID
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { nome: "Alterado Sem ID" },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição PATCH para {string} com novos dados', (apiUrl) => {
    const authToken = Cypress.env('authToken');

    cy.request({
        method: 'PATCH',
        url: `http://localhost:3000${apiUrl}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: { nome: "Tentativa de Edição Inválida" },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição GET para listar os equipamentos do ambiente de teste', () => {
    const authToken = Cypress.env('authToken');
    const ambienteId = Cypress.env('ambienteId');

    cy.request({
        method: 'GET',
        url: `${API_URL}/api/equipamentos?ambiente_id=${ambienteId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição GET para obter o histórico do equipamento de teste', () => {
    const authToken = Cypress.env('authToken');
    const equipamentoId = Cypress.env('equipamentoId');
    cy.request({
        method: 'GET',
        url: `${API_URL}/api/equipamentos/${equipamentoId}/historico`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});


When('eu envio uma requisição DELETE para {string}', (equipamentoId) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'DELETE',
        url: `http://localhost:3000/api/equipamentos/${equipamentoId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false
    }).as('apiResponse');
});

When('eu envio uma requisição DELETE para um equipamento com ID inexistente {string}', (equipamentoId) => {
    const authToken = Cypress.env('authToken');
    cy.request({
        method: 'DELETE',
        url: `http://localhost:3000/api/equipamentos/${equipamentoId}`,
        headers: { 'Authorization': `Bearer ${authToken}` },
        failOnStatusCode: false // Essencial para o teste não falhar com o erro 404
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
    cy.get('@apiResponse').then((response) => {
        expect(response.body.message).to.equal(mensagem);
    });
});

Then('a resposta deve conter uma lista com {int} equipamentos', (quantidade) => {
    cy.get('@apiResponse').its('body').should('have.length', quantidade);
});

Then('a resposta da requisição de equipamento deve ter o status {int}', (statusCode) => {
    cy.get('@apiResponse').its('status').should('eq', statusCode);
});

Then('o corpo da resposta deve conter o histórico com pelo menos {int} entrada(s)', (qtdHistorico) => {
    cy.get('@apiResponse').its('body.historico.length').should('be.gte', qtdHistorico);
});
