
Feature: API para Gerenciar Equipamentos
    Como um administrador, eu quero poder criar, editar e remover equipamentos
    dentro de um ambiente específico.

    Background:
        Given eu estou autenticado como um administrador
        And um ambiente com o identificador "Lab-Central" é criado

    Scenario: Adicionar um novo equipamento a um ambiente com sucesso
        When eu envio uma requisição POST para "/api/equipamentos" para adicionar o equipamento "Projetor BenQ" ao ambiente de teste
        Then a resposta da requisição deve ter o status 201
        And o corpo da resposta deve conter o equipamento com o nome "Projetor BenQ"

    Scenario: Tentar adicionar um equipamento sem um campo obrigatório
        When eu envio uma requisição POST para "/api/equipamentos" com o corpo faltando um campo obrigatório
        Then a resposta da requisição de equipamento deve ter o status 400
        And o corpo da resposta deve conter a mensagem "Os campos 'nome' e 'quantidade_total' são obrigatórios."

    Scenario: Alterar os dados de um equipamento existente
        Given um equipamento com nome "Mouse Velho" é criado no ambiente de teste
        When eu envio uma requisição PATCH para o equipamento de teste com os novos dados:
        | nome       | marca |
        | Mouse Novo | Dell  |
        Then a resposta da requisição deve ter o status 200
        And o corpo da resposta deve conter o equipamento com o nome "Mouse Novo"

    Scenario: Remover um equipamento de um ambiente
        Given um equipamento com nome "Cadeira Quebrada" é criado no ambiente de teste
        When eu envio uma requisição DELETE para remover o equipamento de teste
        Then a resposta da requisição deve ter o status 200
        And o corpo da resposta deve conter a mensagem "Equipamento deletado com sucesso!"

    Scenario: Falha ao tentar remover um equipamento com uma reserva futura
        Given um equipamento com uma reserva futura é criado
        When eu envio uma requisição DELETE para remover o equipamento de teste
        Then a resposta da requisição deve ter o status 409
        And o corpo da resposta deve conter a mensagem "Não é possível excluir o equipamento pois ele possui reservas futuras"