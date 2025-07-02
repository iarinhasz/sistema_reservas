Feature: Serviço de Gerenciamento de Recursos e Equipamentos
  To permitir a administração eficaz dos espaços e seus ativos
  As a sistema de reservas
  I want gerenciar o ciclo de vida dos recursos e dos equipamentos a eles associados através de operações de serviço.

  Scenario: Atualização dos detalhes de um recurso (espaço)
    Given o recurso com ID "Lab1" existe no sistema com nome "Laboratório Antigo 1" e tipo "Laboratório de Informática"
    When uma solicitação de serviço é recebida para atualizar o recurso "Lab1" com o novo nome "Laboratório de Robótica Avançada Lab1" e tipo "Laboratório Especializado"
    Then os dados do recurso "Lab1" no banco de dados devem ser atualizados para nome "Laboratório de Robótica Avançada Lab1" e tipo "Laboratório Especializado"
    And uma entrada de log de auditoria deve ser criada registrando a alteração no recurso "Lab1" pelo Adiministrador

  Scenario: Exclusão de um recurso (espaço) sem reservas futuras
    Given o recurso com ID "Lab1" existe no sistema
    And o recurso "Lab1" não possui reservas futuras ativas
    And o recurso "Lab1" possui os equipamentos associados "EQP001", "EQP002"
    When uma solicitação de serviço é recebida para excluir o recurso "Lab1"
    Then o recurso "Lab1" deve ser marcado como "excluído" ou removido do banco de dados
    And todos os equipamentos associados ("EQP001", "EQP002") devem ser desassociados ou marcados como "inativos"
    And uma notificação (opcional) pode ser enviada aos administradores sobre a exclusão

  Scenario: Tentativa de exclusão de um recurso (espaço) com reservas futuras
    Given o recurso com ID "SalaReuniao" existe no sistema
    And o recurso "SalaReuniao" possui reservas futuras ativas
    When uma solicitação de serviço é recebida para excluir o recurso "SalaReuniao"
    Then a operação de exclusão deve falhar
    And uma resposta de erro "Recurso não pode ser excluído pois possui reservas futuras" deve ser retornada

  Scenario: Adição de um novo equipamento a um recurso existente
    Given o recurso com ID "Lab1" existe no sistema
    When uma solicitação de serviço é recebida para adicionar um equipamento com detalhes (Fabricante: "Dell", Modelo: "Optiplex 7090", Quantidade: 5, Descrição: "Desktop i7") ao recurso "Lab1"
    Then um novo registro de equipamento deve ser criado no banco de dados associado ao recurso "Lab1_ID" com os detalhes fornecidos
    And o novo equipamento deve receber um ID único (ex: "EQP003")
    And o histórico de equipamentos do "Lab1" deve registrar a adição do "EQP003"

  Scenario: Remoção de um equipamento de um recurso
    Given o recurso "Lab1" possui o equipamento "EQP001" (Projetor Epson X3) associado
    When uma solicitação de serviço é recebida para remover o equipamento "EQP001" do recurso "Lab1"
    Then o equipamento "EQP001" deve ser desassociado do recurso "Lab1" ou marcado como "removido"
    And o histórico de equipamentos do "Lab1" deve registrar a remoção do "EQP001"

  Scenario: Alteração dos dados de um equipamento existente em um recurso
    Given o recurso "Lab1" possui o equipamento "EQP002" com descrição "Mouse sem fio" e quantidade "10"
    When uma solicitação de serviço é recebida para alterar o equipamento "EQP002" do recurso "Lab1" para descrição "Mouse óptico USB" e quantidade "8"
    Then os dados do equipamento "EQP002" associado ao "Lab1" devem ser atualizados no banco de dados
    And o histórico de equipamentos do "Lab1" deve registrar a alteração do "EQP002"