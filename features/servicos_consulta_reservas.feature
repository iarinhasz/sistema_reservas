Feature: Serviço de Consulta de Dados do Sistema de Reservas
  To fornecer informações consolidadas sobre reservas, recursos e avaliações
  As a sistema de reservas
  I want to permitir a consulta eficiente de dados para visualizações e relatórios.

  Scenario: Obtenção de reservas de um recurso para exibição na agenda semanal
    Given o recurso "Lab1" possui várias reservas aprovadas entre "2025-12-08" e "2025-12-14"
    When o Serviço de Consulta recebe uma solicitação para obter as reservas do recurso "Lab1" para o período de "2025-12-08" a "2025-12-14"
    Then o serviço deve retornar uma lista de eventos de reserva para "Lab1" dentro do período especificado
    And cada evento na lista deve conter pelo menos: ID da reserva, data/hora de início, data/hora de fim, nome do solicitante (ou finalidade)

  Scenario: Geração de relatório de histórico de reservas para um recurso em um período
    Given existem múltiplas reservas (aprovadas, rejeitadas, canceladas) para o recurso "Lab1" entre "2025-01-01" e "2025-06-30"
    When o Serviço de Consulta recebe uma solicitação de relatório de histórico para "Lab1" no período "2025-01-01" a "2025-06-30"
    Then o serviço deve retornar um conjunto de dados contendo todas as reservas (e seus status) para "Lab1" no período, incluindo informações do solicitante, datas e horários.

  Scenario: Obtenção de avaliações de um recurso específico
    Given o recurso "Auditório" possui várias avaliações registradas por usuários (ex: nota 5, comentário "Excelente!"; nota 3, comentário "Iluminação fraca")
    When o Serviço de Consulta recebe uma solicitação para obter as avaliações do recurso "Auditório"
    Then o serviço deve retornar uma lista de todas as avaliações associadas ao "Auditório", incluindo nota, comentário (se houver), e data da avaliação.

  Scenario: Obtenção do histórico de modificações de equipamentos de um recurso
    Given o recurso "Lab1" teve equipamentos adicionados, removidos e alterados ao longo do tempo, e essas ações foram registradas
    When o Serviço de Consulta recebe uma solicitação para obter o histórico de equipamentos do "Lab1"
    Then o serviço deve retornar uma lista cronológica de todas as modificações de equipamentos para "Lab1", incluindo tipo de ação (adição, remoção, alteração), detalhes do equipamento e data da modificação.