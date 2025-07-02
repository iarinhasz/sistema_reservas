Funcionalidade: Gerenciamento de Espaços Existentes

  Para manter as informações dos espaços sempre atualizadas
  ou para remover recursos que não estão mais em uso,
  como um administrador, eu preciso poder editar e excluir os espaços cadastrados.

  Contexto:
    Dado que sou um administrador logado no sistema
    And que o espaço "Lab1" do tipo "Laboratório" já existe

  Cenário: Editar as informações de um espaço com sucesso
    Dado que eu estou na página de gerenciamento do espaço "Lab1"
    Quando eu altero o nome do espaço para "Laboratório de Robótica"
    And eu clico no botão "Salvar Alterações"
    Then eu devo ver a mensagem "Espaço atualizado com sucesso"
    And eu devo ser redirecionado para a lista de espaços
    And o nome "Laboratório de Robótica" deve estar visível na lista

  Cenário: Excluir um espaço com sucesso
    Dado que eu estou na página de gerenciamento do espaço "Lab1"
    Quando eu clico na opção "Excluir Espaço"
    And eu confirmo a exclusão na janela de diálogo
    Then eu devo ver a mensagem "Espaço 'Lab1' foi removido com sucesso"
    And o espaço "Lab1" não deve mais aparecer na lista de espaços

  Cenário: Tentar excluir um espaço que possui reservas futuras
    # Este é um cenário de teste de regra de negócio importante
    Dado que o espaço "Lab1" possui reservas agendadas para o futuro
    And que eu estou na página de gerenciamento do espaço "Lab1"
    When eu clico na opção "Excluir Espaço"
    And eu confirmo a exclusão na janela de diálogo
    Then eu devo ver uma mensagem de erro "Não é possível excluir um espaço com reservas futuras"
    And o espaço "Lab1" deve permanecer na lista de espaços