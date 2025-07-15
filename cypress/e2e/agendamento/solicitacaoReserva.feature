Feature: Gerenciamento de Reservas

    Para garantir o uso justo e correto dos recursos, o sistema deve
    permitir que usuários autorizados solicitem reservas e que administradores
    gerenciem essas solicitações.

    Background:
        Given um equipamento do tipo "Projetor Multimídia" com nome "Projetor A" existe
        And um equipamento do tipo "Projetor Multimídia" com nome "Projetor B" existe

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

    Scenario: Professor tenta solicitar reserva em horário ocupado
        Given estou autenticado como o usuário "professor@email.com"
        And uma reserva do "ambiente" com id "1" existe no período "2025-11-15T09:00:00-03:00" a "2025-11-15T11:00:00-03:00"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                  | data_inicio               | data_fim                  |
            | 1          | ambiente     | Reunião de Departamento | 2025-11-15T10:00:00-03:00 | 2025-11-15T12:00:00-03:00 |
        Then a resposta deve ter o status 409
        And o corpo da resposta deve conter a propriedade "message" com o valor "Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado."

    Scenario: Aluno tenta solicitar equipamento em horário ocupado
        Given estou autenticado como o usuário "aluno@email.com"
        And uma reserva do "equipamento" com id "1" existe no período "2025-08-10T13:00:00-03:00" a "2025-08-10T15:00:00-03:00"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                 | data_inicio               | data_fim                  |
            | 1          | equipamento  | Reunião de Estudos     | 2025-08-10T14:00:00-03:00 | 2025-08-10T16:00:00-03:00 |
        Then a resposta deve ter o status 409
        And o corpo da resposta deve conter a propriedade "message" com o valor "Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado."

    Scenario: Usuário tenta criar reserva com data fim anterior à data início
        Given estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo           | data_inicio               | data_fim                  |
            | 1          | equipamento  | Reunião Inválida | 2025-08-10T14:00:00-03:00 | 2025-08-10T13:00:00-03:00 |
        Then a resposta deve ter o status 400
        And o corpo da resposta deve conter a propriedade "message" com o valor "A data de fim deve ser posterior à data de início."

    Scenario: Usuário tenta criar reserva para data passada
        Given estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo                 | data_inicio               | data_fim                  |
            | 1          | equipamento  | Reunião no passado     | 2024-07-15T10:00:00-03:00 | 2024-07-15T11:00:00-03:00 |
        Then a resposta deve ter o status 400
        And o corpo da resposta deve conter a propriedade "message" com o valor "Não é possível criar reservas para datas passadas."

    Scenario: Usuário tenta criar reserva com formato de data inválido
        Given estou autenticado como o usuário "aluno@email.com"
        When eu envio uma requisição POST para "/api/reservas" com os dados:
            | recurso_id | recurso_tipo | titulo             | data_inicio   | data_fim      |
            | 1          | equipamento  | Formato de Data Ruim | 2025-08-10T14 | 2025-08-10T16 |
        Then a resposta deve ter o status 400
        And o corpo da resposta deve conter a propriedade "message" com o valor "Formato de data inválido. Use o formato ISO 8601 (ex: 'AAAA-MM-DDTHH:mm:ss-03:00')."