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

    Scenario: Administrador tenta adicionar espaço sem preencher o identificador
        Given o administrador está na página "Adicionar novo espaço"
        When seleciona o tipo "Salas"
        And deixa o campo "Identificador" vazio
        And clica no botão "Adicionar"
        Then uma mensagem de erro "Identificador obrigatório" é exibida indicando que o identificador é obrigatório
        And o espaço não é cadastrado
        And o administrador permanece na página "Adicionar novo espaço"

    Scenario: Administrador cancela o cadastro de novo espaço
        Given o administrador está na página "Adicionar novo espaço"
        When clica no botão "Cancelar"
        Then retorna para a página inicial
        And nenhum novo espaço é cadastrado

    Scenario: Serviço cadastra um novo espaço com dados válidos
        Given o sistema recebe uma requisição de cadastro com:
            | Tipo         | Identificador |
            | Laboratórios | Lab 2         |
        And os dados são validados
        Then o novo espaço "Lab 2" é salvo no banco de dados
        And uma resposta de sucesso é retornada para o frontend
    
    Scenario: Serviço rejeita cadastro de espaço com identificador vazio
        Given o sistema recebe uma requisição de cadastro com:
            | Tipo   | Identificador |
            | Salas  | (vazio)       |
        And os dados são validados
        Then o sistema identifica que o identificador está vazio
        And retorna uma mensagem de erro "Identificador obrigatório"
        And o espaço não é salvo no banco de dados

    Scenario: Serviço rejeita cadastro de espaço com identificador duplicado
        Given já existe um espaço com identificador "Lab 2"
        And o sistema recebe uma nova requisição de cadastro com:
            | Tipo         | Identificador |
            | Laboratórios | Lab 2         |
        And os dados são validados
        Then o sistema detecta que o identificador já está em uso
        And retorna uma mensagem de erro "Identificador já cadastrado"
        And o novo espaço não é salvo