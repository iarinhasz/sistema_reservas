Funcionalidade: Gerenciamento de Equipamentos de um Espaço

  Para garantir que os usuários saibam quais equipamentos estão disponíveis
  em cada espaço e para manter o inventário atualizado,
  como um administrador, eu preciso poder adicionar, editar e remover equipamentos de um espaço específico.

  Contexto:
    Dado que sou um administrador logado no sistema
    And que o espaço "Lab1" já existe e contém um equipamento "Projetor Epson T3000"
    And eu estou na página de gerenciamento de equipamentos do "Lab1"

  Cenário: Adicionar um novo equipamento com sucesso
    Quando eu preencho o formulário de novo equipamento com os seguintes dados:
      | Fabricante | Modelo      | Quantidade | Descrição          |
      | Dell       | Optiplex 790| 15         | Desktop Core i5    |
    And eu clico no botão "Adicionar Equipamento"
    Then eu devo ver uma mensagem de sucesso "Equipamento 'Dell Optiplex 790' adicionado."
    And o equipamento "Dell Optiplex 790" deve aparecer na lista de equipamentos do "Lab1"

  Cenário: Tentar adicionar um equipamento sem preencher um campo obrigatório
    Quando eu tento adicionar um equipamento com o campo "Modelo" em branco
    Then eu devo ver a mensagem de erro "O campo Modelo é obrigatório"
    And eu devo permanecer na página de gerenciamento de equipamentos
    And nenhum novo equipamento deve ser adicionado à lista

  Cenário: Carregar dados de um equipamento para edição
    Quando eu seleciono o equipamento "Projetor Epson T3000" para editar
    Then o formulário de edição deve ser preenchido com os dados do "Projetor Epson T3000"
    And o botão "Salvar Alterações" deve ficar visível

  Cenário: Editar um equipamento existente com sucesso
    Dado que eu carreguei os dados do "Projetor Epson T3000" para edição
    Quando eu altero o campo "Quantidade" para "2"
    And eu clico no botão "Salvar Alterações"
    Then eu devo ver a mensagem de sucesso "Equipamento atualizado."
    And a lista deve mostrar que o "Projetor Epson T3000" agora tem a quantidade "2"

  Cenário: Remover um equipamento existente
    Quando eu seleciono o equipamento "Projetor Epson T3000" para remover
    And eu confirmo a remoção na janela de diálogo
    Then eu devo ver a mensagem de sucesso "Equipamento removido."
    And o "Projetor Epson T3000" não deve mais aparecer na lista de equipamentos do "Lab1"

  Cenário: Cancelar a remoção de um equipamento
    Quando eu seleciono o equipamento "Projetor Epson T3000" para remover
    And eu cancelo a ação na janela de diálogo de confirmação
    Then o equipamento "Projetor Epson T3000" deve continuar na lista, sem alterações