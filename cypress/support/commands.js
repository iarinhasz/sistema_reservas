Cypress.Commands.add('login', (email, senha) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/auth/login`, // Usa a variável do cypress.config.js
        body: { email, senha },
    }).then((response) => {
        // Confirma que o login na API foi bem-sucedido
        expect(response.status).to.eq(200);
        
        // Pega o token da resposta e o salva no localStorage do navegador
        const token = response.body.token;
        cy.window().then((win) => {
        win.localStorage.setItem('authToken', token); // Use a chave correta que sua aplicação usa
        });

        // Também salva no ambiente do Cypress para outras chamadas de API
        Cypress.env('authToken', token);
    });
});