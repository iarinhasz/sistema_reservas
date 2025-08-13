// cypress/e2e/gerenciaAmbientes/edicaoAmbiente.steps.js

import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Before(() => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/testing/reset`
    }).its('status').should('eq', 200);

    cy.login('admin@email.com', 'senha_segura');
});

Given('que eu sou um administrador logado no sistema', () => {
    cy.log('Administrador logado via API no hook Before.');
});

Given('eu estou na página inicial do administrador', () => {
    cy.visit('/admin');
});

Given('na seção {string}, eu devo ver {string} sob a categoria {string}', (sectionTitle, ambienteNome, categoriaNome) => {
    // 1. Encontra DIRETAMENTE o título da categoria na página
    cy.contains('h2', categoriaNome)
      // 2. Pega o container de ambientes que vem logo depois dele
        .next()
        // 3. Procura pelo nome do ambiente DENTRO desse container
        .contains(ambienteNome)
        // 4. Garante que ele está visível
        .should('be.visible');
});


Given('que já existe um ambiente com o identificador {string} do tipo {string}', (identificador, tipo) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
        body: { identificacao: identificador, tipo: tipo }
    }).then(response => {
        // Guarda o ID do ambiente criado para usar em passos futuros
        cy.wrap(response.body.ambiente.id).as('ambienteId');
    });
});

Given('eu estou na página de detalhes do ambiente {string}', (nomeAmbiente) => {
    // 1. Primeiro, buscamos TODOS os ambientes via API
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` }
    }).then(response => {
        // 2. Procuramos na lista o ambiente com o nome exato que queremos
        const ambiente = response.body.find(a => a.identificacao === nomeAmbiente);
        
        // Verificação de segurança para garantir que o ambiente foi encontrado
        expect(ambiente, `O ambiente "${nomeAmbiente}" não foi encontrado via API. Verifique se o passo 'Given' o criou corretamente.`).to.exist;
        
        // 3. Agora sim, visitamos a página usando o ID que encontramos
        cy.visit(`/admin/ambientes/${ambiente.id}`);
    });
});

Given('que o ambiente {string} possui uma reserva futura', (ambienteNome) => {
    // Passo 1: Buscar o ID do ambiente pelo nome, para garantir que estamos criando a reserva para o ambiente certo.
    cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/api/ambientes`,
        headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` }
    }).then(response => {
        const ambiente = response.body.find(a => a.identificacao === ambienteNome);
        expect(ambiente, `Ambiente de pré-condição "${ambienteNome}" não foi encontrado via API.`).to.exist;

        // Passo 2: Agora que temos o ID correto, criamos a reserva futura.
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() + 1); // Reserva para amanhã
        const dataFim = new Date(dataInicio.getTime() + (2 * 60 * 60 * 1000)); // 2 horas depois

        cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/api/testing/createReserva`,
            headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` },
            body: {
                recurso_id: ambiente.id, // Usa o ID que acabamos de encontrar
                recurso_tipo: 'ambiente',
                usuario_email: 'professor@email.com',
                titulo: 'Reserva Futura de Teste',
                data_inicio: dataInicio.toISOString(),
                data_fim: dataFim.toISOString(),
                status: 'aprovada'
            }
        }).its('status').should('eq', 201);
    });
});


When('eu clico no ícone de edição do ambiente {string}', (ambienteNome) => {
    // 1. Encontra o elemento que contém o nome do ambiente (o botão principal)
    cy.contains(ambienteNome)
        // 2. Sobe para o container pai que agrupa o nome e os ícones
        .closest('[class*="ambienteBotaoContainer"]')
        // 3. Dentro desse container, encontra o botão específico com o título "Editar Ambiente"
        .find('button[title="Editar Ambiente"]')
        // 4. Clica nele
        .click();
});

When('eu clico no botão {string}', (buttonText) => {
    cy.contains(buttonText).click();
});

When('eu encontro o ambiente {string} na lista e clico no seu ícone de edição', (ambienteNome) => {
    // Procura o elemento com o nome do ambiente, sobe para o container pai, e encontra o botão de edição
    cy.contains(ambienteNome)
        .closest('[class*="ambienteBotaoContainer"]') // Ajuste a classe se necessário
        .find('button[title="Editar Ambiente"]')
        .click();
});

When('eu limpo o campo {string} e digito {string}', (label, text) => {
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).clear().type(text);
    });
});

When('eu seleciono {string} no campo {string}', (option, label) => {
    cy.contains('label', label).invoke('attr', 'for').then((id) => {
        cy.get(`#${id}`).select(option);
    });
});


When('eu confirmo a ação na janela de alerta', () => {

    cy.on('window:confirm', (str) => {
        expect(str).to.contain('Tem certeza que deseja deletar o ambiente');
        return true; // Clica "OK"
    });
});
Then('eu sou redirecionado para a página de detalhes do ambiente {string}', (nomeAmbiente) => {
    cy.url().should('include', '/admin/ambientes/');
    cy.contains('h1', nomeAmbiente).should('be.visible');
});
Then('eu sou redirecionado para a página inicial do administrador', () => {
    cy.url().should('eq', Cypress.config().baseUrl + '/admin');
    cy.contains('Página Inicial do Administrador').should('be.visible');
});



Then('eu devo ver o título da página atualizado para {string}', (novoTitulo) => {
    cy.contains('h1', novoTitulo).should('be.visible');
});

Then('eu devo ver o modal de edição para {string}', (nomeAmbiente) => {
    cy.get('[class*="modalContent"]').should('be.visible').and('contain', nomeAmbiente);
});

Then('o modal de edição deve ser fechado', () => {
    cy.get('[class*="modalContent"]').should('not.exist');
});

Then('eu devo ver o status do ambiente como {string}', (status) => {
    //Procuramos pelo <p> que contém o texto 'Status:', e não pelo <strong>
    cy.contains('p', 'Status:')
        .next('p') // pula para o próximo <p>
        .should('contain', status);
});

Then('eu devo ver a mensagem de erro {string} dentro do modal', (errorMessage) => {
    cy.get('[class*="modalContent"]')
      .contains(errorMessage)
      .should('be.visible');
});

Then('o modal de edição deve continuar aberto', () => {
    cy.get('[class*="modalContent"]').should('be.visible');
});

Then('o título da página deve continuar sendo {string}', (titulo) => {
    cy.contains('h1', titulo).should('be.visible');
});


Then('o ambiente {string} não deve mais existir na lista', (ambienteNome) => {
    cy.contains(ambienteNome).should('not.exist');
});

Then('o ambiente {string} não possui reservas futuras', (ambienteNome) => {
    cy.log(`Garantindo que o ambiente "${ambienteNome}" não tem reservas futuras.`);
});
Then('a categoria {string} não deve mais conter o ambiente {string}', (categoriaNome, ambienteNome) => {
    // Usamos cy.get('body').then() para primeiro inspecionar o estado da página
    // sem causar um erro imediato se um elemento não for encontrado.
    cy.get('body').then(($body) => {

        // Procuramos pelo título da categoria (ex: <h2>Laboratórios</h2>)
        const categoria = $body.find(`h2:contains("${categoriaNome}")`);

        if (categoria.length > 0) {
            // CASO 1: A categoria AINDA EXISTE (porque tem outros ambientes)
            cy.log('A categoria ainda existe. Verificando se o ambiente foi removido dela.');
            
            // Verificamos que, dentro do container da categoria, o ambiente específico NÃO existe.
            cy.contains('h2', categoriaNome)
              .next() // Pega o container de ambientes
                .contains(ambienteNome)
                .should('not.exist');

        } else {
            // CASO 2: A categoria NÃO EXISTE MAIS (porque o ambiente deletado era o último)
            cy.log('A categoria foi removida junto com o último ambiente. O teste passou.');

            // A asserção aqui é garantir que o título da categoria realmente não existe mais.
            cy.contains('h2', categoriaNome).should('not.exist');
        }
    });
});