Feature: rotinas adminitrativas do "Lab1"
    As Administrador do sistema de reservas
    I Want to Editar informações do espaço, excluir o espaço, aprovar ou rejeitar as solicitações de reserva, visualizar o histórico de reservas, fazer reservas, gerenciar os equipamentos do espaço, saber quem tinha ou terá reservas em um periodo específico e analisar as avaliações
    so that manter a ordem e o bom uso do espaço e seus equipamentos

    Scenario: Administrador Edita informações de identificação do "Lab1", nome e tipo
        Given estou na página que exibe a agenda do "Lab1"
        And vejo o botão "Editar"
        When eu clico no botão "Editar"
        Then sou direcionado para outra página de edição da identificação do "Lab1"

    Scenario: Administrador deseja excluir o "Lab1"
        Given estou na página que exibe a agenda do "Lab1"
        And vejo o botão "Excluir"
        When clico no botão "Excluir"
        Then sou direcionado para um outra tela que me perguntará se desejo realmente excluir o "Lab1"
        And dá a confirmação da ação

    Scenario: Administrador constata que há reservas a serem efetuadas para o "Lab1"
        Given estou na página que exibe a agenda do "Lab1"
        And que há uma solicitação de reserva esperando uma decisão do "Zé Administrador"
        And as informações da reserva estão listadas junto como o botão de efetuar ou rejeitar reserva
        When clico no botão "Efetuar"
        Then uma mensagem de confirmação da reserva é exibida
        And os dados relativos a solicitação reserva são retirados da lista
        And A nova reserva pode ser observada visualização da agenda do "Lab1"

    Scenario: Administrador constata que há reservas que devem ser rejeitadas
        Given estou na página que exibe a agenda do "Lab1"
        And que há uma reserva que não deverá ser efetuada
        When clico no botão "Rejeitar"
        Then uma tela de confirmação é apresentada com as opções de confirmar ou cancelar
        And se confirmada a solicitação de reserva sai da lista
        And se cancelada o foco apenas volta para a página que esta a lista de solicitações

    Scenario: Administrador necessita visualizar o calendário de reservas
        Given pretendo navegar pelas reservas nos agendamentos do espaço
        When navego pela agenda do "Lab1"
        Then posso visualisar todas as reservas na agenda do "Lab1"
        And irão ser exibidas no formato de agenda semanal

    Scenario: Adiministrador necessita reservar espaço com prioridade
        Given estou na página que exibe a agenda do "Lab1"
        And selecionei a data "10/12/2025"
        And selecionei o horário inicial "13:00"
        And Seleciona o horário final "15:00"
        When clico no botão "Efetuar reserva"
        Then Uma mensagem de confirmação surge na tela
        And A reserva fica registrada na agenda do espaço

    Scenario: Administrador precisa fazer o gerenciamento de equipamentos no "Lab1"
        Given estou na página das de agendamentos de reservas do "Lab1"
        And vejo o botão "Equipamentos"
        When clico no botão "Equipamentos"
        Then vou para a página que gerencia equipamentos

    Scenario: Administrador deseja vê informações sobre reservas do "Lab1"
        Given estou na página que exibe a agenda do "Lab1"
        And estou visualizando o botão "Relatório"
        When eu clico no botão "Relatório"
        Then sou direcionado para a página onde posso filtrar as reservas por período

    Scenario: Adiministrador necessita visualizar os reviews dados ao "Lab1"
        Given estou na página que exibe a agenda do "Lab1"
        And estou vendo o botão de "Avaliações"
        When eu clico no botão de "Avaliações"
        Then eu sou direcionado para uma janela que contem todas as avalieções
