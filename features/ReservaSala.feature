Feature: Reserva de Sala

    As professor
    I want to reservar salas, laborários ou auditórios
    So that eles fiquem disponíveis na área de gerenciamento

    Background:
        Given o professor está autenticado no sistema
        And acessa a funcionalidade de reserva de sala

    Scenario: Visualiza agenda da sala deseja
        When o professor visualizar a agenda de sala desejada
        Then deve conseguir identificar facilmente as datas e horários já reservados e os disponíveis
    
    Scenario: Seleção de data e horário para reserva
        Given o sistema apresenta um submenu "Calendário"
        When o professor acessa esse submenu
        And seleciona uma data no submenu "Calendário"
        Then o submenu "Hora Inicial" será habilitado, permitindo a escolha do inicío da reserva
        When o porfessor seleciona a hora inicial
        Then o submenu "Hora Final" será habilitado, permitindo a escolha do término da reserva
        When o porfessor seleciona a hora final
        And todas as informações obrigatórias estiverem preenchidas:
           | Data         |
           | Hora Inicial |
           | Hora Final   |
        Then o botão "Solicitar Reserva" será habilitado, permitindo ao usuário concluir a solicitação de reserva de sala 

    Scenario: Professor acessa sala agendada
        Given possui uma sala previamente agendada no sistema
        When acessa a funcionalidade "Minhas Reservas"
        And seleciona a sala desejada na lista de reservas
        Then o sistema deve exibir os detalhes da sala agendada
        And as seguintes informações devem está visíveis:
            | Nome da Sala              |
            | Data da Reserva           |
            | Hora Inicial              |
            | Hora Final                |
            | Opção para Avaliar a Sala |

    Scenario: Professor tenta reserva sala em horário já ocupado
        Given a sala desejada já está reservada na data e hora selecionadas
        When tenta solicitar a reserva
        Then o sistema deve exibir a mensagem "Horário indisponível para reserva"
        And o botão "Solicitar Reserva" deve permanecer desabilitado

    Scenario: Professor cancela uma reserva de sala
        Given possui uma sala previamente agendada
        When acessa a funcionalidade "Minha Reservas"
        And seleciona a sala que deseja cancelar
        And clica na opção "Cancelar Reserva"
        Then o sistema deve solicitar um confirmação para o cancelamento
        When o professor confirma o cancelamento
        Then a reserva deve ser removida da lista de reservas
        And o sistema deve exibir uma mensagem de sucesso: "Reserva cancelada com sucesso !"