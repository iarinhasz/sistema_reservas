Feature: Solicitação de cadastro de usuário (aluno e professor)

  Background:
    Given o sistema está rodando

  Scenario: Solicitar cadastro
    When envio uma solicitação de cadastro com nome "João", cpf "12345678901", email "joao@email.com", senha "abc123", tipo "aluno"
    Then recebo status 201
    And recebo a mensagem "Solicitação de cadastro recebida! Aguardando aprovação do administrador."

#    Scenario: Solicitar cadastro
#    When envio uma solicitação de cadastro com nome "João", cpf "12345678901", email "joao@email.com", senha "abc123", tipo "professor"
#    Then recebo status 201
#    And recebo a mensagem "Solicitação de cadastro recebida! Aguardando aprovação do administrador."