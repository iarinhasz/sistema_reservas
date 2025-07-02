Feature: Gerenciar equipamentos do "Lab1"
    As a Adiministrador do sistema de reservas
    I want to inserir, remover, alterar e visualizar as informações de equipamentos dispostos em um ambiente
    so that ter o gerenciamento de equipamentos para seus devidos usos

    Scenario: Administrador Tenta inserir equipamentos sem os campos serem preenchidos
        Given eu estou na página de gerenciamento de equipamentos
        And sem os campos "Fabricante", "Modelo", "Quantidade" e "Descrição" de equipamentos preenchidos
        When eu clico no botão "Inserir"
        Then uma seguinte mensagem é exíbida "Preencha todos os campos para fazer a inserção de um equipamento".

    Scenario: Adiministrador inserindo um equipamento no ambiente
        Given eu estou na página de gerenciamento de equipamentos
        And o campo "Fabricante" está com o valor "Epson"
        And o campo "Modelo" está com o valor "T3000"
        And o campo "Quantidade" está com o valor "1"
        And o campo "Descrição" está com o valor "Impressora lazer"
        When Clico o botão "Inserir"
        Then Então o equipamento aparece na listagem de equipamentos contidos no espaço
        And uma caixa de seleção é ativada na primeira coluna a frente das informações que foram inseridas referente ao equipamento

    Scenario: clicando no botão "Excluir" sem selecionar nenhum equipamento
        Given eu estou na página de gerenciamento de equipamentos 
        And sem selecionar nenhuma caixa de seleção ao lado de um equipamento da lista
        When eu tento clicar no botão "Excluir"
        Then o botão de excluir se encontra desabilitado
        And uma mensagem próxima ao ponteiro do mouse é exibida "Você deve selecionar um item da lista"

    Scenario: clicando no botão "Excluir" com um equipamento selecionado
        Given eu estou na página de gerenciamento de equipamentos e selecionei um equipamento da lista
        And todas as outras caixas de seleção ficam desabilitadas
        When eu clico no botão "Excluir"
        Then uma caixa de confirmação é exibida perguntando se tenho certeza da exclusão do referido equipamento
        And após confirmar o equipamento é excluído da lista dos equipamentos

    Scenario: clicando no botão "Alterar" sem ter selecionado nenhum equipamento do espaço
        Given eu estou na tela de gerencia de equipamentos
        And que não há nenhum equipamento com a caixa de seleção marcada
        When eu clico no botão de "Alterar"
        Then uma mensagem é exíbida "Você deve selecionar um equipamento"

    Scenario: com um equipamento selecionado e clicando no botão "Alterar"
        Given que estou com um equipamento selecionado
        When clico no botão "Alterar"
        Then os dados do equipamento vão para os campos antes utilizados para inserir
        And se alguma informação for alterada o botão "Inserir" é abilitado
        And o equipamento pode ser alterado
        And ele é atualizado na lista que exibe os equipamentos do espaço

    Scenario: necessidade de obter o histórico de equipamentos
        Given estou na pagina de gerenciamento dos equipamentos
        When clico no botão de "Histórico"
        Then uma nova página é apresentada exibindo todo o histórico de equipamentos daquele espaço
