Feature: Adicionar espaços

    As administrador do sistema
    I want to cadastrar novos espaços (salas, laboratórios, auditórios, outros)
    So that eles fiquem disponíveis na área de gerenciamento

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
        Then o novo espaço "Lab 2" é adicionado à lista de Laboratórios
        And o administrador é redirecionado para a página inicial
        And o botão "Lab 2" aparece na interface

    Scenario: Cadastro de espaço com dados válidos
        Given o sistema recebe uma requisição de cadastro com tipo "Laboratórios" e identificador "Lab 2"
        And o identificador "Lab 2" ainda não está cadastrado no sistema
        When a solicitação de cadastro é processada
        Then o novo espaço "Lab 2" é salvo no banco de dados como tipo "Laboratórios"
        And uma resposta de sucesso é retornada para o frontend

    Scenario: Administrador tenta adicionar espaço sem preencher o identificador
        Given o administrador está na página "Adicionar novo espaço"
        When seleciona o tipo "Salas"
        And deixa o campo "Identificador" vazio
        And clica no botão "Adicionar"
        Then uma mensagem de erro "Identificador obrigatório" é exibida indicando que o identificador é obrigatório
        And o espaço não é cadastrado
        And o administrador permanece na página "Adicionar novo espaço"

    Scenario: Rejeição de cadastro com identificador vazio
        Given o sistema recebe uma requisição de cadastro com tipo "Salas" e identificador vazio
        When sistema verifica os dados
        And identifica que o campo "Identificador" está vazio (NULL)
        Then o sistema retorna uma mensagem de erro "Identificador obrigatório"
        And nenhum espaço é salvo no banco de dados
        And a página de cadastro continua aberta

    Scenario: Rejeição de cadastro com identificador duplicado
        Given já existe um espaço cadastrado com identificador "Lab 2"
        And o sistema recebe uma nova requisição de cadastro com tipo "Laboratórios" e identificador "Lab 2"
        When valida os dados
        Then o sistema detecta que o identificador já está em uso
        And retorna uma mensagem de erro "Identificador já cadastrado"
        And o novo espaço não é salvo no banco de dados
        And a página de cadastro continua aberta

    Scenario: Administrador cancela o cadastro de novo espaço
        Given o administrador está na página "Adicionar novo espaço"
        When clica no botão "Cancelar"
        Then retorna para a página inicial
        And nenhum novo espaço é cadastrado

    Scenario: Cancelamento da requisição de cadastro
        Given o sistema recebe uma solicitação de cancelamento de cadastro de espaço antes da confirmação
        When o processo de cadastro é interrompido
        Then nenhuma alteração é feita no banco de dados
        And nenhuma resposta de criação é enviada
