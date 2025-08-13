Feature: Cadastro de Ambiente
    Como um Administrador,
    Eu quero cadastrar novos ambientes no sistema
    Para que eles fiquem disponíveis para reserva.

Background:
    Given que eu sou um administrador logado no sistema
    And eu estou na página inicial do administrador

Scenario: Cadastrar um novo ambiente com sucesso
    When eu clico no botão "+ Cadastrar Novo Ambiente"
    And eu preencho o campo "Identificador do Ambiente" com "Sala de Conferências 101"
    And eu seleciono "Salas de Reunião" no campo "Tipo de Ambiente"
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu vejo a mensagem "Ambiente cadastrado com sucesso! Redirecionando..."
    And eu sou redirecionado para a página inicial do administrador
    And na seção "Visão Geral dos Ambientes", eu devo ver "Sala de Conferências 101" sob a categoria "Salas de Reunião"

Scenario: Cadastrar um ambiente com espaços extras no início e no fim
    Given eu estou na página de cadastro de ambiente
    When eu preencho o campo "Identificador do Ambiente" com "  Laboratório de Robótica  "
    And eu seleciono "Laboratórios" no campo "Tipo de Ambiente"
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu vejo a mensagem "Ambiente cadastrado com sucesso! Redirecionando..."
    And eu sou redirecionado para a página inicial do administrador
    And na seção "Visão Geral dos Ambientes", eu devo ver "Laboratório de Robótica" sob a categoria "Laboratórios"


Scenario: Tentar cadastrar um ambiente com identificador já existente
    Given que já existe um ambiente com o identificador "Laboratório de Hardware"
    When eu clico no botão "Cadastrar Novo Ambiente"
    And eu preencho o campo "Identificador do Ambiente" com "Laboratório de Hardware" 
    And eu seleciono "Laboratórios" no campo "Tipo de Ambiente"
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu devo ver uma mensagem de erro "Identificador já cadastrado"
    And eu devo continuar na página de cadastro de ambiente

Scenario: Tentar cadastrar um ambiente sem preencher o identificador
    When eu clico no botão "Cadastrar Novo Ambiente"
    And eu deixo o campo "Identificador do Ambiente" em branco
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu devo ver a mensagem de validação "Preencha este campo." associada ao campo "Identificador do Ambiente"
    And eu devo continuar na página de cadastro de ambiente

Scenario: Tentar cadastrar um ambiente com identificador muito curto
    Given eu estou na página de cadastro de ambiente
    When eu preencho o campo "Identificador do Ambiente" com "A1"
    And eu seleciono "Salas de Aula" no campo "Tipo de Ambiente"
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu devo ver uma mensagem de erro "O identificador deve ter no mínimo 3 caracteres."
    And o ambiente "A1" não deve ser criado
    And eu devo continuar na página de cadastro de ambiente

Scenario: Tentar cadastrar um ambiente com caracteres especiais no identificador
    Given eu estou na página de cadastro de ambiente
    When eu preencho o campo "Identificador do Ambiente" com "Sala #Final!"
    And eu seleciono "Salas de Aula" no campo "Tipo de Ambiente"
    And eu submeto o formulário com o botão "Cadastrar Ambiente"
    Then eu devo ver uma mensagem de erro "O identificador pode conter apenas letras, números, espaços e hífens."
    And o ambiente "Sala #Final!" não deve ser criado
    And eu devo continuar na página de cadastro de ambiente

