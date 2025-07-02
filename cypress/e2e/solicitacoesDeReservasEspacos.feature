Feature: Gerenciamento de Solicitações de Reserva como Administrador

  Para garantir o uso correto dos espaços e atender às solicitações,
  As um administrador, eu preciso poder aprovar, rejeitar ou criar
  reservas diretamente para um recurso específico.

  Background:
    Given sou um administrador logado no sistema
    And que o espaço "Lab1" existe
    And que o usuário "Prof. Carlos" solicitou uma reserva para o "Lab1" no dia "10/12/2025" das "14:00" às "15:00"

  Scenario: Aprovar uma solicitação de reserva pendente
    When eu acesso a página de gerenciamento do "Lab1"
    And eu aprovo a solicitação do "Prof. Carlos"
    Then eu devo ver a mensagem "Reserva confirmada com sucesso"
    And a solicitação não deve mais aparecer na lista de pendências
    And a agenda do "Lab1" deve mostrar o horário das "14:00" às "15:00" do dia "10/12/2025" como ocupado

  # O cenário de rejeição foi dividido em dois para testar cada caminho separadamente.
  # Um cenário deve testar apenas um resultado final.
  Scenario: Rejeitar uma solicitação de reserva pendente
    When eu acesso a página de gerenciamento do "Lab1"
    And eu rejeito a solicitação do "Prof. Carlos"
    Then a solicitação não deve mais aparecer na lista de pendências
    And eu devo ver a mensagem "Reserva rejeitada"
    And a agenda do "Lab1" não deve ter o horário bloqueado

  Scenario: Criar uma reserva direta como administrador
    Given eu estou na página de gerenciamento do "Lab1"
    When eu crio uma nova reserva direta com os seguintes dados:
      | Solicitante    | Data       | Horário Inicial | Horário Final |
      | Convidado VIP  | 15/12/2025 | 09:00           | 11:00         |
    Then eu devo ver a mensagem "Reserva criada com sucesso"
    And a agenda do "Lab1" deve mostrar o horário das "09:00" às "11:00" do dia "15/12/2025" como ocupado