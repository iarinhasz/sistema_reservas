Feature: Serviço de Processamento e Criação de Reservas
  To gerenciar o fluxo de solicitações e a criação direta de reservas
  As a sistema de reservas
  I want processar decisões sobre solicitações pendentes e permitir a criação de reservas por administradores.

  Scenario: Aprovação de uma solicitação de reserva pendente
    Given existe uma solicitação de reserva "REQ123" para o recurso "Lab1" pelo usuário "professor_silva@email.com" para "2025-12-10" das "10:00" às "12:00", com estado "Pendente"
    When o Serviço de Processamento de Reservas recebe uma ação de aprovação para a solicitação "REQ123" por um administrador
    Then o estado da solicitação "REQ123" deve ser atualizado para "Aprovada" no banco de dados
    And um evento de reserva deve ser criado para "Lab1" em "2025-12-10" das "10:00" às "12:00" vinculado ao usuário "professor_silva@email.com"
    And uma chamada ao Serviço de Integração com Agenda deve ser disparada para criar o evento no calendário do recurso "Lab1"
    And uma chamada ao Serviço de Notificação deve ser disparada para enviar um e-mail de confirmação para "professor_silva@email.com"

  Scenario: Rejeição de uma solicitação de reserva pendente
    Given existe uma solicitação de reserva "REQ456" para o recurso "Auditório" pelo usuário "aluno_joao@email.com" para "2025-11-15" das "14:00" às "16:00", com estado "Pendente"
    When o Serviço de Processamento de Reservas recebe uma ação de rejeição para a solicitação "REQ456" por um administrador, com motivo "Conflito de horário com evento prioritário"
    Then o estado da solicitação "REQ456" deve ser atualizado para "Rejeitada" no banco de dados
    And o motivo da rejeição "Conflito de horário com evento prioritário" deve ser registrado para a solicitação "REQ456"
    And uma chamada ao Serviço de Notificação deve ser disparada para enviar um e-mail de rejeição para "aluno_joao@email.com" com o motivo

  Scenario: Criação de reserva direta por um administrador
    Given o administrador "admin_gestor@email.com" deseja criar uma reserva para o recurso "SalaProjetor"
    And os detalhes da reserva são: usuário "visitante_externo@email.com", data "2025-10-20", início "09:00", fim "11:00", finalidade "Apresentação Externa"
    When o Serviço de Processamento de Reservas recebe uma solicitação de criação de reserva direta
    Then um novo evento de reserva deve ser criado diretamente no banco de dados com estado "Aprovada" para o recurso "SalaProjetor" com os detalhes fornecidos
    And uma chamada ao Serviço de Integração com Agenda deve ser disparada para criar o evento no calendário do recurso "SalaProjetor"
    And (Opcional) uma chamada ao Serviço de Notificação pode ser disparada para informar "visitante_externo@email.com" e/ou "admin_gestor@email.com"