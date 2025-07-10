Feature: API de Adicionar Ambientes
    Para gerenciar os espaços do sistema, um administrador
    deve poder criar novos ambientes através da API,
    com as devidas validações de negócio.

    Background:
        Given eu estou autenticado como um administrador

    Scenario: Sucesso no cadastro de espaço com dados válidos
        When eu envio uma requisição POST para "/api/ambientes" com o corpo:
        | tipo            | identificacao |
        | sala de reuniao | sala05        |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter o ambiente com o identificador "sala05"

    Scenario: Rejeição de cadastro de espaço com identificador vazio
        When eu envio uma requisição POST para "/api/ambientes" com o corpo:
        | tipo  | identificacao |
        | Sala  |               |
        Then a resposta deve ter o status 400
        And o corpo da resposta deve conter a mensagem "Identificador obrigatório"

    Scenario: Rejeição de cadastro com identificador duplicado
        Given um ambiente com o identificador "Lab Duplicado" já existe
        When eu envio uma requisição POST para "/api/ambientes" com o corpo:
        | tipo        | identificacao  |
        | Laboratório | Lab Duplicado  |
        Then a resposta deve ter o status 409
        And o corpo da resposta deve conter a mensagem "Identificador já cadastrado"