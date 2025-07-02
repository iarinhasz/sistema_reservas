Feature: Edição de recursos pelo ADM
Como administrador do sistema
Quero editar os recursos
Para manter as informações atualizadas

Background:
    Given estou logado como administrador
    And estou na página inicial do sistema
    And quero editar recursos

Scenario: Administrador acessa a página de edição de recursos  
    When clico no botão "Editar Recursos"
    Then os recursos disponíveis se tornam buttons
    And vejo os recursos disponíveis para edição:
        | Editar Salas        |
        | Editar Laboratórios |
        | Editar Auditórios   |

Scenario: Administrador clica em "Editar Sala"
    Given estou na página de edição de recursos
    When clico em " Editar Salas"
    Then os recursos "Laboratórios" e "Auditórios" somem
    And em cada sala cadastrada aparecem as opções:
        | Editar dados   |
        | Remover sala   |
    And no final da lista de salas cadastradas aparece a opção:
        | Cadastrar sala |

Scenario: Administrador clica em "Editar dados" da sala "S1"
    Given estou na página de edição de recursos
    And visualizei a lista de salas cadastradas
    When clico em "Editar dados" da sala "S1"
    Then sou redirecionado para uma nova tela com os dados da sala "S1"
    And os seguintes campos são exibidos e editáveis:
        | Nome da sala  |
        | Categoria     |
        | Equipamentos  |
    And os botões "Salvar" e "Cancelar" estão visíveis abaixo do formulário

Scenario: Administrador salva os dados editados da sala
    Given estou na tela de edição dos dados da sala "S1"
    And os campos "Nome da sala", "Categoria" e "Equipamentos" foram modificados
    When clico no botão "Salvar"
    Then vejo uma mensagem de sucesso: "Dados da sala atualizados com sucesso"
    And sou redirecionado de volta para a lista de salas
    And as informações atualizadas da sala "S1" são exibidas na lista

Scenario: Administrador cancela a edição dos dados da sala
    Given estou na tela de edição dos dados da sala "S1"
    When clico no botão "Cancelar"
    Then sou redirecionado de volta para a lista de salas
    And nenhuma alteração é aplicada aos dados da sala "S1"


Scenario: Administrador clica em "-" (remover sala)
    Given estou na seção de salas dentro da página de edição de recursos
    When clico em "Remover sala" da sala "S1"
    Then aparece uma mensagem de confirmação: "Tem certeza que deseja remover esta sala?"
    And são exibidas as opções:
        | Sim  |
        | Não  |

Scenario: Administrador confirma a remoção da sala
    Given estou na seção de salas dentro da página de edição de recursos
    And cliquei em "Remover sala" da sala "S1"
    And vejo a mensagem: "Tem certeza que deseja remover esta sala?"
    When clico na opção "Sim"
    Then a sala "S1" é removida da lista de salas
    And uma mensagem de sucesso é exibida: "Sala removida com sucesso"

Scenario: Administrador cancela a remoção da sala
    Given estou na seção de salas dentro da página de edição de recursos
    And cliquei em "Remover sala" da sala "S1"
    And vejo a mensagem: "Tem certeza que deseja remover esta sala?"
    When clico na opção "Não"
    Then a mensagem de confirmação desaparece
    And a sala "S1" continua visível na lista de salas
