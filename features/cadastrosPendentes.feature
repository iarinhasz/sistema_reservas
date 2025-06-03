Feature: Cadastros pendentes

    As administrador do sistema
    I want to visualizar e gerenciar solicitações de cadastro de novos usuários
    So that eu possa aprovar ou rejeitar com justificativa e notificar os solicitantes por email

    Scenario: Administrador acessa a tela de solicitações de cadastro
        Given o administrador está na página inicial
        When clica em "Solicitações de cadastro"
        Then é redirecionado para a página "Aprovar Cadastro"
        And é exibida uma tabela com os campos "Nome", "Tipo" e "Email"
        And cada linha da tabela possui os botões "Aprovar" e "Descartar"

    Scenario: Administrador aprova uma solicitação de cadastro
        Given o administrador está na página "Aprovar Cadastro"
        When clica no botão "Aprovar" ao lado da solicitação de João (tipo: Aluno, email: joao@email.com)
        Then o "João" é cadastrado no sistema com o tipo "Aluno"
        And a solicitação é removida da lista
        And um email de confirmação de cadastro é enviado para o solicitante "joao@email.com"
    
    Scenario: Envio de email após aprovação de cadastro
        Given existe uma solicitação de cadastro pendente no sistema
        When o administrador aprova a solicitação
        Then o usuário é cadastrado no sistema com o tipo informado
        And um email de confirmação é enviado automaticamente para o endereço informado

    Scenario: Aprovação de solicitação de cadastro
        Given existe uma solicitação de cadastro pendente para o usuário João, do tipo "Aluno", com o email "joao@email.com"
        And o email "joao@email.com" ainda não está cadastrado no sistema
        When o sistema processa a solicitação como aprovada
        Then os dados de João são inseridos no banco de dados como um novo usuário do tipo "Aluno"
        And a solicitação de João é removida da base de dados de pendências
        And um email de confirmação de cadastro é enviado para "joao@email.com"

    Scenario: Administrador descarta uma solicitação de cadastro com justificativa
        Given o administrador está na página "Aprovar Cadastro"
        When clica no botão "Descartar" ao lado de uma solicitação
        And informa o motivo da rejeição no campo exibido
        And clica em "confirmar"
        Then a solicitação é removida da lista
        And o usuário não é cadastrado no sistema
        And um email de rejeição com o motivo informado é enviado para o solicitante

    Scenario: Rejeição de solicitação de cadastro com justificativa
        Given existe uma solicitação de cadastro pendente para a usuária Maria, do tipo "Professor", com o email "maria@email.com"
        And o administrador informou o motivo da rejeição como "Dados inconsistentes"
        When o sistema processa a solicitação como rejeitada
        Then a solicitação de Maria é removida da base de dados de pendências
        And nenhum usuário é inserido no banco de dados
        And um email de rejeição contendo o motivo "Dados inconsistentes" é enviado para "maria@email.com"

    Scenario: Impedir rejeição de solicitação sem motivo
        Given o administrador está rejeitando uma solicitação de cadastro
        And não preencheu o campo "motivo da rejeição"
        When clica em "confirmar"
        Then uma mensagem de erro é exibida indicando que o motivo é obrigatório
        And a solicitação não é processada

    Scenario: Tentativa de rejeição sem justificativa
        Given existe uma solicitação de cadastro pendente para o usuário Carlos, do tipo "Aluno", com o email "carlos@email.com"
        And nenhum motivo de rejeição foi informado
        When o sistema tenta processar a solicitação como rejeitada
        Then o sistema retorna um erro informando que o motivo da rejeição é obrigatório
        And a solicitação de Carlos permanece na base de dados
        And nenhum email é enviado

    Scenario: Não há solicitações de cadastro pendentes
        Given o administrador está na página "Aprovar Cadastro"
        And não existem solicitações pendentes
        Then uma mensagem é exibida indicando "Nenhuma solicitação pendente no momento"
        And a tabela não é exibida

    Scenario: Nenhuma solicitação pendente no momento
        Given o sistema realiza uma consulta no banco de dados por solicitações de cadastro pendentes
        And não encontra nenhuma solicitação
        Then retorna uma resposta vazia com a mensagem "Nenhuma solicitação pendente"
    
    
