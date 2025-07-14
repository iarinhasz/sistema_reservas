Feature: Gerenciamento de Reservas

    Para garantir o uso justo e correto dos recursos, o sistema deve
    permitir que usuários autorizados solicitem reservas e que administradores
    gerenciem essas solicitações.

    Background:

    Scenario: Professor solicita uma reserva de ambiente com sucesso
        Given estou autenticado como o usuário "professor@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                        | data_inicio               | data_fim                  |
            | 1          | ambiente     | Aula de Redes de Computadores | 2025-10-20T10:00:00-03:00 | 2025-10-20T12:00:00-03:00 |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter a propriedade "status" com o valor "pendente"
