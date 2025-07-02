Feature: Envio de Review

    As professor
    I want to enviar um review sobre a reserva realizada
    So that a avaliação fique registrada e disponível na área de gerenciamento

     Background:
        Given o professor está autenticado no sistema
        And acessor a funcionalidade de reserva de sala

    Scenario: Fluxo de envio do review 
        Given o sistema apresentou o campo "Mensagem"
        When o professor digita o conteúdo da sua mensagem
        Then o botão "Enviar" deve ser habilitado

        And o sistema apresenta o botão "Cancelar"
        When o professor clica no botão "Cancelar"
        Then o envio do review deve ser cancelado e o professor retorna à tela anterior

    Scenario: Tentativa de envio sem mensagem
        When o professor tenta enviar o review sem preencher o campo "Mensagem"
        Then o sistema deve exibir uma mensagem solicitando que algo seja digitado
        And o botão "Enviar" permanece desabilitado

    Scenario: Confirmação após envio de review
        Given o professor digitou uma mensagem válida na funcionalidadede envio de review
        When clica no botão "Enviar"
        Then o sistema deve exibir a mensagem "Review enviado com sucesso !"
        And redireciona para a área de gerenciamento de reservas