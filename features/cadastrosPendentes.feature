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

    Scenario: Administrador descarta uma solicitação de cadastro com justificativa
        Given o administrador está na página "Aprovar Cadastro"
        When clica no botão "Descartar" ao lado de uma solicitação
        And informa o motivo da rejeição no campo exibido
        And clica em "confirmar"
        Then a solicitação é removida da lista
        And o usuário não é cadastrado no sistema
        And um email de rejeição com o motivo informado é enviado para o solicitante

    Scenario: Impedir rejeição de solicitação sem motivo
        Given o administrador está rejeitando uma solicitação de cadastro
        And não preencheu o campo "motivo da rejeição"
        When clica em "confirmar"
        Then uma mensagem de erro é exibida indicando que o motivo é obrigatório
        And a solicitação não é processada

    Scenario: Envio de email após aprovação de cadastro
        Given existe uma solicitação de cadastro pendente no sistema
        When o administrador aprova a solicitação
        Then o usuário é cadastrado no sistema com o tipo informado
        And um email de confirmação é enviado automaticamente para o endereço informado


    Scenario: Não há solicitações de cadastro pendentes
        Given o administrador está na página "Aprovar Cadastro"
        And não existem solicitações pendentes
        Then uma mensagem é exibida indicando "Nenhuma solicitação pendente no momento"
        And a tabela não é exibida

