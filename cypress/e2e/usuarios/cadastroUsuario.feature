Feature: Solicitação de cadastro de usuário (aluno e professor)

  Background:


  Scenario: Solicitar cadastro como aluno
    When envio uma solicitação de cadastro com nome "Aluno", cpf "12345678910", email "aluno1@email.com", senha "senha_segura", tipo "aluno"
    Then recebo status 201
    And recebo a mensagem "Solicitação de cadastro recebida! Aguarde a aprovação do administrador."
  
  Scenario: Solicitar cadastro como professor
    When envio uma solicitação de cadastro com nome "Professor", cpf "12345678911", email "professor1@email.com", senha "senha_segura", tipo "professor"
    Then recebo status 201
    And recebo a mensagem "Solicitação de cadastro recebida! Aguarde a aprovação do administrador."

  Scenario: Tentar solicitar cadastro com um campo obrigatório faltando
    When eu envio uma solicitação de cadastro sem o campo "nome"
    Then recebo status 400
    And recebo a mensagem "Cpf, nome, email, senha e tipo são obrigatórios"

  Scenario: Tentar solicitar cadastro com um CPF de formato inválido
    When envio uma solicitação de cadastro com nome "Fulano", cpf "123456", email "teste@email.com", senha "senha_forte", tipo "aluno"
    Then recebo status 400
    And recebo a mensagem "O CPF informado é inválido."

  Scenario: Tentar solicitar cadastro com email que já pertence a um usuário ativo
    When envio uma solicitação de cadastro com nome "Outro Aluno", cpf "33344455566", email "aluno@email.com", senha "senha_qualquer", tipo "aluno"
    Then recebo status 409
    And recebo a mensagem "Este email já está em uso."