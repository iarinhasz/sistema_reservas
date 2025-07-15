Feature: Avaliação de Reservas (Reviews)

    Como um usuário do sistema,
    Eu quero poder deixar uma avaliação (nota e comentário) sobre um recurso que utilizei,
    Para que outros usuários possam se beneficiar da minha experiência.

    Background:
        Given um ambiente com identificacao "LAB-INFO-01" existe
        And um equipamento do tipo "Projetor" com nome "Projetor da Sala 1" existe no ambiente "LAB-INFO-01"
        And o usuário "aluno.experiente@email.com" do tipo "aluno" existe e está ativo
        And o usuário "aluno.curioso@email.com" do tipo "aluno" existe e está ativo

    Scenario: Usuário avalia sua própria reserva com sucesso após o término
        Given uma reserva APROVADA para o equipamento "Projetor da Sala 1" feita pelo "aluno.experiente@email.com" que TERMINOU ONTEM existe
        And estou autenticado como o usuário "aluno.experiente@email.com"
        When eu envio uma requisição POST para avaliar a reserva com nota "5" e comentário "Projetor com ótima imagem e brilho."
        Then a resposta deve ter o status 200
        And recebo a mensagem "Review enviado com sucesso!"


    Scenario: Tentar avaliar uma reserva que ainda não terminou
        Given uma reserva APROVADA para o equipamento "Projetor da Sala 1" feita pelo "aluno.experiente@email.com" que TERMINA AMANHÃ existe
        And estou autenticado como o usuário "aluno.experiente@email.com"
        When eu envio uma requisição POST para avaliar a reserva com nota "4" e comentário "Ansioso para usar!"
        Then a resposta deve ter o status 403
        And a resposta deve conter a mensagem "Acesso proibido. A reserva ainda não terminou."

    Scenario: Tentar avaliar uma reserva que já foi avaliada
        Given uma reserva APROVADA para o "LAB-INFO-01" feita pelo "aluno.experiente@email.com" que TERMINOU ONTEM e JÁ POSSUI REVIEW existe
        And estou autenticado como o usuário "aluno.experiente@email.com"
        When eu envio uma requisição POST para avaliar a reserva novamente
        Then a resposta deve ter o status 409
        And recebo a mensagem "Esta reserva já foi avaliada e não pode ser alterada."

    Scenario: Tentar avaliar uma reserva com ID inexistente
        Given estou autenticado como o usuário "aluno.experiente@email.com"
        When eu envio uma requisição POST para avaliar uma reserva com o ID "9999" que não existe
        Then a resposta deve ter o status 404
        And recebo a mensagem "Reserva não encontrada."