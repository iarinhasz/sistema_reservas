Feature: Adicionar espaços

    Como administrador do sistema
    Eu quero cadastrar novos espaços (salas, laboratórios, auditórios, outros)
    Para que eles fiquem disponíveis na área de gerenciamento

    Scenario: Administrador acessa a página de adição de espaço
        Given o administrador está na página inicial
        When clica no botão "Adicionar"
        Then é redirecionado para a página "Adicionar novo espaço"
        And os campos "Tipo" e "Identificador" estão visíveis
        And os botões "Cancelar" e "Adicionar" estão visíveis

    Scenario: Administrador preenche e confirma os dados de um novo espaço
        Given o administrador está na página "Adicionar novo espaço"
        When seleciona o tipo "Laboratórios"
        And preenche o identificador com "Lab 2"
        And clica no botão "Adicionar"
        Then o administrador é redirecionado para a "Página inicial"
        And o novo espaço "Lab 2" aparece na interface

    Scenario: Administrador tenta adicionar espaço sem preencher o identificador
        Given o administrador está na página "Adicionar novo espaço"
        When seleciona o tipo "Salas"
        And deixa o campo "Identificador" vazio
        And clica no botão "Adicionar"
        Then uma mensagem de erro "Identificador obrigatório" é exibida
        And o espaço não é cadastrado
        And o administrador permanece na página "Adicionar novo espaço"

    Scenario: Administrador cancela o cadastro de novo espaço
        Given o administrador está na página "Adicionar novo espaço"
        When clica no botão "Cancelar"
        Then retorna para a "Página inicial"
        And nenhum novo espaço é cadastrado

    Scenario: Sucesso no cadastro de espaço com dados válidos
        Given o sistema recebe uma requisição de cadastro com tipo "Laboratórios" e identificador "Lab 2"
        And o identificador "Lab 2" ainda não está cadastrado no sistema
        When a solicitação de cadastro é processada
        Then o novo espaço "Lab 2" é salvo no banco de dados como tipo "Laboratórios"
        And uma resposta de sucesso (ex: código 201) é retornada

    Scenario: Rejeição de cadastro de espaço com identificador vazio
        Given o sistema recebe uma requisição de cadastro com tipo "Salas" e identificador vazio
        When o sistema valida os dados
        Then o sistema rejeita a requisição com uma resposta de erro (código 400) contendo a mensagem "Identificador obrigatório"
        And nenhum espaço é salvo no banco de dados

    Scenario: Rejeição de cadastro com identificador duplicado
        Given já existe um espaço cadastrado com identificador "Lab 2"
        And o sistema recebe uma nova requisição de cadastro com tipo "Laboratórios" e identificador "Lab 2"
        When o sistema valida os dados
        Then o sistema rejeita a requisição com uma resposta de erro (código 409) contendo a mensagem "Identificador já cadastrado"
        And o novo espaço não é salvo no banco de dados