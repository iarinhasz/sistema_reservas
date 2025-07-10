Cypress.Commands.add('login', (email, senha) => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: { email, senha },
    }).then((response) => {
        // Verifica se o login foi bem-sucedido
        expect(response.status).to.eq(200);
        // Salva o token retornado pela API em uma variável de ambiente do Cypress
        Cypress.env('authToken', response.body.token);
    });
});