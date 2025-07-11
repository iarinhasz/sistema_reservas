
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

    Scenario: Tentar criar um equipamento com nome duplicado no mesmo ambiente
        Given um equipamento com nome "Projetor Epson" é criado no ambiente de teste
        When eu envio uma requisição POST com o mesmo nome
        Then a resposta da requisição deve ter o status 409
        And o corpo da resposta deve conter a mensagem "Já existe um equipamento com esse nome neste ambiente"
        
    Scenario: Listar equipamentos de um ambiente específico
        Given o ambiente "Lab-Central" tem 2 equipamentos cadastrados
        When eu envio uma requisição GET para listar os equipamentos do ambiente de teste
        Then a resposta da requisição deve ter o status 200
        And a resposta deve conter uma lista com 2 equipamentos

    Scenario: Alterar os dados de um equipamento existente
        Given um equipamento com nome "Mouse Velho" é criado no ambiente de teste
        When eu envio uma requisição PATCH para o equipamento de teste com os novos dados:
        | nome       | marca |
        | Mouse Novo | Dell  |
        Then a resposta da requisição deve ter o status 200
        And o corpo da resposta deve conter o equipamento com o nome "Mouse Novo"

    Scenario: Tentar editar um equipamento que não existe
        When eu envio uma requisição PATCH para "/api/equipamentos/9999" com novos dados
        Then a resposta da requisição deve ter o status 404
        And o corpo da resposta deve conter a mensagem "Equipamento não encontrado ou nenhum campo válido foi fornecido."

    Scenario: Remover um equipamento de um ambiente
        Given um equipamento com nome "Cadeira Quebrada" é criado no ambiente de teste
        When eu envio uma requisição DELETE para remover o equipamento de teste
        Then a resposta da requisição deve ter o status 200
        And o corpo da resposta deve conter a mensagem "Equipamento deletado com sucesso!"

    Scenario: Tentar deletar um equipamento inexistente
        When eu envio uma requisição DELETE para "/api/equipamentos/9999"
        Then a resposta da requisição deve ter o status 404
        And o corpo da resposta deve conter a mensagem "Equipamento não encontrado"


    Scenario: Falha ao tentar remover um equipamento com uma reserva futura
        Given um equipamento com uma reserva futura é criado
        When eu envio uma requisição DELETE para remover o equipamento de teste
        Then a resposta da requisição deve ter o status 409
        And o corpo da resposta deve conter a mensagem "Não é possível excluir o equipamento pois ele possui reservas futuras"