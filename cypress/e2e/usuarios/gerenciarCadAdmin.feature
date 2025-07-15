Feature: Gerenciamento de Solicitações de Cadastro pelo Administrador

    Para garantir que apenas usuários legítimos acessem o sistema,
    o administrador deve poder visualizar, aprovar e rejeitar
    as solicitações de cadastro pendentes.

    Background:
        Given uma solicitação de cadastro para o usuário "Aluno Pendente" com CPF "11122233344" e email "aluno.pendente@email.com" existe
        And uma solicitação de cadastro para o usuário "Professor Pendente" com CPF "55566677788" e email "professor.pendente@email.com" existe
        And estou autenticado como o usuário "admin@email.com"

    Scenario: Administrador lista todas as solicitações de cadastro pendentes
        When eu envio uma requisição GET para "/api/usuarios/pendentes"
        Then a resposta deve ter o status 200
        And o corpo da resposta deve ser uma lista contendo 2 usuários
        And a lista de usuários deve conter o email "aluno.pendente@email.com"

    Scenario: Administrador aprova uma solicitação de cadastro com sucesso
        When eu envio uma requisição POST para aprovar o cadastro com CPF "11122233344"
        Then a resposta deve ter o status 200
        And recebo a mensagem "Usuário aprovado com sucesso!"

    Scenario: Administrador rejeita uma solicitação de cadastro com justificativa
        When eu envio uma requisição POST para rejeitar o cadastro com CPF "55566677788" com a justificativa "Dados inconsistentes."
        Then a resposta deve ter o status 200
        And recebo a mensagem "Usuário rejeitado com sucesso!"

    Scenario: Tentar rejeitar uma solicitação sem fornecer uma justificativa
        When eu envio uma requisição POST para rejeitar o cadastro com CPF "55566677788" sem justificativa
        Then a resposta deve ter o status 400
        And recebo a mensagem "O motivo da rejeição é obrigatório."