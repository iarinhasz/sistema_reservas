# language: pt
Funcionalidade: Visualização da Agenda de um Espaço

  Para que qualquer usuário possa verificar a disponibilidade de um recurso
  antes de fazer uma solicitação, o sistema deve exibir uma agenda semanal
  clara com os horários ocupados e disponíveis.

  Contexto:
    Dado que o espaço "Auditório Principal" existe no sistema
    And que existe uma reserva aprovada para o "Auditório Principal" para amanhã, das "14:00" às "16:00", com o título "Palestra de IA"

  Cenário: Visualizar um horário ocupado na agenda
    Quando um visitante acessa a página de visualização do "Auditório Principal"
    Then ele deve ver um calendário em formato de grade semanal
    And o bloco de tempo de amanhã, entre "14:00" e "16:00", deve estar marcado como "Ocupado"
    And ao passar o mouse ou clicar, o título "Palestra de IA" deve ser visível

  Cenário: Visualizar horários disponíveis na agenda
    Quando um visitante acessa a página de visualização do "Auditório Principal"
    Then o bloco de tempo de amanhã, entre "10:00" e "12:00", deve estar marcado como "Disponível"

  Cenário: Navegar para a próxima semana na agenda
    # Para este cenário, a condição inicial precisaria de uma reserva na semana seguinte
    Dado que também existe uma reserva para o "Auditório Principal" na próxima semana com o título "Workshop de Scrum"
    And um visitante está na página de visualização do "Auditório Principal"
    When ele clica no botão ou seta para "Próxima Semana"
    Then a agenda deve exibir as datas da semana seguinte
    And o evento "Workshop de Scrum" deve estar visível no dia e horário corretos