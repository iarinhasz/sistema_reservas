Feature: rotinas de determinado espaço
    As Administrador do sistema de reservas
    I Want Editar informações do espaço, excluir o espaço, aprovar ou rejeitar as solicitações de reserva, visualizar o histórico de reservas, fazer reservas, gerenciar os equipamentos dos espaços, saber por quem tinha ou terá reservas em um periodo específico e analisar as avaliações
    so that manter a ordem e o bom uso dos espaços

    Scenario: Editar informações de identificação do espaço nome e tipo
        Given vejo o botão "Editar"
        When eu clico no botão "Editar"
        Then sou direcionado para outra pagina de edição da identificação do espaço

    Scenario: Deseja-se excluir o ambiente
        Given vejo o botão "Excluir"
        When clico em "Excluir"
        Then sou direcionado para um outra tela que me perguntará se desejo realmente excluir aquele espaço

    Scenario: Constata-se que há reservas a serem efetuadas
        Given que há uma solicitação de reserva esperando uma decisão da administração
        And as informações da reserva estão listadas junto como o botão de efetuar ou rejeitar reserva
        When clico no botão "Efetuar"
        Then uma mensagem de confirmação da reserva é exibida
        And os dados relativos a solicitação reserva são retirados da lista

    Scenario: Constata-se que há reservas que devem ser rejeitadas
        Given que há uma reserva não deverá ser efetuada
        When clico no botão "Rejeitar"
        Then uma tela de confirmação é apresentada como as opções de confirmar ou cancelar
        And se confirmada a solicitação de reserva sai da lista
        And se cancelar o foco apens volta para a página que esta a lista de solicitações
        
    Scenario: Necessidade de visualizar o calendário de reservas
        Given pretendo navegar pelas reservas na nos agendamentos do espaço
        When navego pela agenda
        Then posso visualisar todas as reservas na agenda do espaço
        And irão ser exibidas no formato de agenda semanal

    Scenario: Há a necessidade de se reservar espaço com prioridade
        Given selecionei a data
        And Seleciona os horários
        When clico no botão "Efetuar reserva"
        Then Uma mensagem de confirmação é surge na tela
        And A reserva fica registrada na agenda do espaço

    Scenario: Preciso fazer o gerenciamento de equipamentos no espaço que estou acessando
        Given estou na pagina das de agendamentos de reservas do espaço
        When clico em "Equipamentos"
        Then vou para a pagina que gerencia equipamentos

    Scenario: preciso de informações sobre reservas que aconteceram em um derterminado periodo
        Given que estou visualizando o botão "Relatório"
        When eu clico no botão "Relatório"
        Then sou direcionado para a página onde posso filtrar as reservas por período

    Scenario: Há a necessidade de visualizar os reviews dados ao ambiente ou a equipamentos
        Given estou vendo o botão de "Avaliações"
        When eu clico no botão de "Avaliações"
        Then eu sou direcionado para uma janela que contem todas as avalieções