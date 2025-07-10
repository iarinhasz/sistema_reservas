# cypress/e2e/ambientes/adicionar_ambiente.feature

Feature: API de Adicionar Ambientes
    Para gerenciar os espaços do sistema, um administrador
    deve poder criar novos ambientes através da API,
    com as devidas validações de negócio.

    Background:
        Given eu estou autenticado como um administrador

    Scenario: Sucesso no cadastro de espaço com dados válidos
        When eu envio uma requisição POST para "/api/ambientes" com os dados válidos:
        | tipo         | identificacao       |
        | Laboratório  | Lab Teste Cypress   |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter o ambiente com o identificador "Lab Teste Cypress"

    Scenario: Rejeição de cadastro de espaço com identificador vazio
        When eu envio uma requisição POST para "/api/ambientes" com o identificador vazio
        Then a resposta deve ter o status 400
        And o corpo da resposta deve conter uma mensagem de erro sobre campos obrigatórios

    Scenario: Rejeição de cadastro com identificador duplicado
        Given um ambiente com o identificador "Lab Duplicado" já existe
        When eu envio uma requisição POST para "/api/ambientes" com os dados válidos:
        | tipo         | identificacao   |
        | Laboratório  | Lab Duplicado   |
        Then a resposta deve ter o status 409
        And o corpo da resposta deve conter a mensagem "Identificador já cadastrado"