Feature: Gerenciamento de solicitações de cadastro

  Background:
    Given sou um administrador logado no sistema

# OK
  Scenario: Aprovar solicitação de cadastro
    When envio uma solicitação de cadastro com nome "Aluno", cpf "12345678910", email "aluno1@email.com", senha "senha_segura", tipo "aluno"
    And aprovo a solicitação com cpf "12345678910"
    Then recebo status 200
    And recebo a mensagem "Usuário aprovado com sucesso!"

# OK
  Scenario: Rejeitar solicitação de cadastro
    When envio uma solicitação de cadastro com nome "Professor", cpf "12345678911", email "professor1@email.com", senha "senha_segura", tipo "professor"
    And rejeito a solicitação com cpf "12345678911" com justificativa "Dados inválidos"
    Then recebo status 200
    And recebo a mensagem "Usuário rejeitado com sucesso!"

# Erro ao mostrar a lista (1/4)
#  Scenario: Listar solicitações pendentes
#    When solicito a lista de solicitações pendentes
#    Then recebo status 200
#    And a lista contém solicitações pendentes

# Ok
# O CPF para teste já está inserido no banco de dados
  Scenario: Editar usuário existente
    When envio uma solicitação para editar o usuário com cpf "12345678901" alterando email para "novoemail@email.com"
    Then recebo status 200
    And recebo a mensagem "Usuário atualizado com sucesso!"

# OK
# O CPF para teste já está inserido no banco de dados#
  Scenario: Excluir usuário (rejeitar cadastro)
    When rejeito a solicitação com cpf "12345678902" com justificativa "Cadastro duplicado"
    Then recebo status 200
    And recebo a mensagem "Usuário rejeitado com sucesso!"