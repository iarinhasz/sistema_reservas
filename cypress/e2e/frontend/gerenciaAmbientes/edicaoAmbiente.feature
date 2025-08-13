Feature: Edição e Gerenciamento de Ambientes
    Como um Administrador,
    Eu quero editar e deletar ambientes existentes
    Para manter as informações do sistema atualizadas.

Background:
    Given que eu sou um administrador logado no sistema
    And que já existe um ambiente com o identificador "Laboratório de Robótica" do tipo "Laboratórios"

Scenario: Navegação da página inicial para a página de detalhes do ambiente
    Given eu estou na página inicial do administrador
    And na seção "Visão Geral dos Ambientes", eu devo ver "Laboratório de Robótica" sob a categoria "Laboratórios"
    When eu clico no ícone de edição do ambiente "Laboratório de Robótica"
    Then eu sou redirecionado para a página de detalhes do ambiente "Laboratório de Robótica"
    And eu devo ver o título da página atualizado para "Laboratório de Robótica"

Scenario: Editar um ambiente com sucesso através do modal
    Given eu estou na página de detalhes do ambiente "Laboratório de Robótica"
    When eu clico no botão "Editar Ambiente"
    And eu limpo o campo "Identificador" e digito "Laboratório de Robótica Avançada"
    And eu seleciono "Em Manutenção" no campo "Status"
    And eu clico no botão "Salvar Alterações"
    Then o modal de edição deve ser fechado
    And eu devo ver o título da página atualizado para "Laboratório de Robótica Avançada"
    And eu devo ver o status do ambiente como "Em Manutenção"

Scenario: Tentar editar um ambiente com um identificador que já existe
    Given que já existe um ambiente com o identificador "Sala de Reunião A" do tipo "Salas de Reunião"
    And eu estou na página de detalhes do ambiente "Sala de Reunião A"
    When eu clico no botão "Editar Ambiente"
    And eu limpo o campo "Identificador" e digito "Laboratório de Robótica"
    And eu clico no botão "Salvar Alterações"
    Then eu devo ver a mensagem de erro "Identificador já cadastrado" dentro do modal
    And o modal de edição deve continuar aberto

Scenario: Cancelar a edição de um ambiente
    Given eu estou na página de detalhes do ambiente "Laboratório de Robótica"
    When eu clico no botão "Editar Ambiente"
    And eu limpo o campo "Identificador" e digito "Nome Inválido"
    And eu clico no botão "Cancelar"
    Then o modal de edição deve ser fechado
    And o título da página deve continuar sendo "Laboratório de Robótica"

Scenario: Deletar um ambiente sem reservas futuras com sucesso
    Given eu estou na página de detalhes do ambiente "Laboratório de Robótica"
    And o ambiente "Laboratório de Robótica" não possui reservas futuras
    When eu clico no botão "Editar Ambiente"
    And eu clico no botão "Deletar"
    And eu confirmo a ação na janela de alerta
    Then eu sou redirecionado para a página inicial do administrador
    And a categoria "Laboratórios" não deve mais conter o ambiente "Laboratório de Robótica"

Scenario: Tentar deletar um ambiente com reservas futuras
    Given que o ambiente "Laboratório de Robótica" possui uma reserva futura
    And eu estou na página de detalhes do ambiente "Laboratório de Robótica"
    When eu clico no botão "Editar Ambiente"
    And eu clico no botão "Deletar"
    And eu confirmo a ação na janela de alerta
    Then eu devo ver a mensagem de erro "Não é possível excluir um espaço com reservas futuras" dentro do modal
    And o modal de edição deve continuar aberto