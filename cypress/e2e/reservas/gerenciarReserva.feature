Feature: Gerenciamento de Reservas

    Para garantir o uso justo e correto dos recursos, o sistema deve
    permitir que usuários autorizados solicitem reservas e que administradores
    gerenciem essas solicitações.

    Background:
        Given um equipamento do tipo "Projetor Multimídia" com nome "Projetor A" existe
        And um equipamento do tipo "Projetor Multimídia" com nome "Projetor B" existe
        And um ambiente com identificação "LAB-02" e nome "Laboratório de Redes" existe

    Scenario: Professor solicita uma reserva de ambiente com sucesso
        Given estou autenticado como o usuário "professor@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                        | data_inicio               | data_fim                  |
            | 1          | ambiente     | Aula de Redes de Computadores | 2025-10-20T10:00:00-03:00 | 2025-10-20T12:00:00-03:00 |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter a propriedade "status" com o valor "pendente"

    Scenario: Aluno solicita reserva de equipamento com sucesso
        Given estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
        | recurso_id | recurso_tipo | titulo                  | data_inicio               | data_fim                  |
        | 1          | equipamento  | Apresentação de TCC     | 2025-08-10T14:00:00-03:00 | 2025-08-10T16:00:00-03:00 |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter a propriedade "status" com o valor "pendente"

    Scenario: Administrador aprova uma reserva pendente
        Given uma reserva pendente com o título "Defesa de Tese" foi criada pelo usuário "aluno@email.com"
        And estou autenticado como o usuário "admin@email.com"
        When eu envio uma requisição PUT para "/api/reservas/1/aprovar"
        Then a resposta deve ter o status 200
        And o corpo da resposta deve conter a propriedade "status" com o valor "aprovada"

    Scenario: Administrador rejeita uma reserva pendente
        Given uma reserva pendente com o título "Workshop de Docker" foi criada pelo usuário "professor@email.com"
        And estou autenticado como o usuário "admin@email.com"
        When eu envio uma requisição PUT para "/api/reservas/1/rejeitar"
        Then a resposta deve ter o status 200
        And o corpo da resposta deve conter a propriedade "status" com o valor "rejeitada"

    Scenario: Usuário cancela sua própria reserva
        Given uma reserva pendente com o título "Estudo em Grupo" foi criada pelo usuário "aluno@email.com"
        And estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição PUT para "/api/reservas/1/cancelar"
        Then a resposta deve ter o status 200

    Scenario: Administrador cria uma reserva diretamente com sucesso
        Given estou autenticado como o usuário "admin@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                      | data_inicio               | data_fim                  |
            | 2          | equipamento  | Manutenção de Equipamentos  | 2025-12-01T14:00:00-03:00 | 2025-12-01T17:00:00-03:00 |
        Then a resposta deve ter o status 201
        And o corpo da resposta deve conter a propriedade "status" com o valor "aprovada"

    Scenario: Usuário lista suas próprias reservas com sucesso
        Given uma reserva pendente com o título "Estudo para Prova de Cálculo" foi criada pelo usuário "aluno@email.com"
        And uma reserva pendente com o título "Apresentação de Projeto" foi criada pelo usuário "aluno@email.com"
        And estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição GET para "/api/reservas/mine"
        Then a resposta deve ter o status 200
        And o corpo da resposta deve ser uma lista contendo 2 itens
        And a lista na resposta deve conter um item com a propriedade "titulo" e valor "Estudo para Prova de Cálculo"

    Scenario: Administrador lista todas as reservas do sistema
        Given uma reserva pendente com o título "Reserva do Aluno A" foi criada pelo usuário "aluno@email.com"
        And uma reserva pendente com o título "Reserva do Professor B" foi criada pelo usuário "professor@email.com"
        And estou autenticado como o usuário "admin@email.com"
        When eu envio uma requisição GET para "/api/reservas"
        Then a resposta deve ter o status 200
        And o corpo da resposta deve ser uma lista contendo pelo menos 2 itens
        And a lista na resposta deve conter um item com a propriedade "titulo" e valor "Reserva do Professor B"