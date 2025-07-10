
Feature: Edicao de Ambiente
    Como um administrador, eu quero poder editar e remover ambientes
    para manter o sistema atualizado.

    Background:
        Given eu estou autenticado como um administrador
        And um ambiente com o identificador "Sala-Para-Teste" e tipo "Sala" é criado para o teste

    Scenario: Administrador edita um ambiente com sucesso
        When eu envio uma requisição PATCH para o ambiente de teste com os novos dados:
        | tipo       | identificacao |
        | Escritório | Sala-Editada  |
        Then a resposta deve ter o status 200
        And o corpo da resposta deve conter o ambiente com o identificador "Sala-Editada"
        And o tipo do ambiente na resposta deve ser "Escritório"

    Scenario: Administrador remove um ambiente com sucesso
        When eu envio uma requisição DELETE para remover o ambiente de teste
        Then a resposta deve ter o status 200
        And o corpo da resposta deve conter a mensagem "Ambiente deletado com sucesso!"