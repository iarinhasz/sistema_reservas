Feature: Solicitação de cadastro de usuário (aluno e professor)

  Background:
    Given o sistema está rodando

  Scenario: Solicitar cadastro como aluno
    When envio uma solicitação de cadastro com nome "Aluno", cpf "12345678910", email "aluno1@email.com", senha "senha_segura", tipo "aluno"
    Then recebo status 201
    And recebo a mensagem "Solicitação de cadastro recebida! Aguardando aprovação do administrador."
  
  Scenario: Solicitar cadastro como professor
    When envio uma solicitação de cadastro com nome "Professor", cpf "12345678911", email "professor1@email.com", senha "senha_segura", tipo "professor"
    Then recebo status 201
    And recebo a mensagem "Solicitação de cadastro recebida! Aguardando aprovação do administrador."
