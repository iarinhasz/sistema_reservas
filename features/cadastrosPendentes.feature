Feature: Cadastros pendentes

    Como administrador do sistema
    Eu quero visualizar e gerenciar solicitações de cadastro de novos usuários
    Para que eu possa aprovar ou rejeitar com justificativa e notificar os solicitantes por e-mail

    Scenario: Administrador acessa a tela de solicitações de cadastro
        Given o administrador está na página inicial
        When clica em "Solicitações de cadastro"
        And é redirecionado para a página "Aprovar Cadastro"
        Then são exibidos as solicitações pendentes
        And existe uma solicitação de cadastro pendente para "Ana Souza" do tipo "Aluno" com o e-mail "ana.souza@email.com"
        And existe uma solicitação de cadastro pendente para "Bruno Lima" do tipo "Professor" com o e-mail "bruno.lima.prof@email.com"
        And existe uma solicitação de cadastro pendente para "Carla Dias" do tipo "Aluno" com o e-mail "carla.d@email.com"

    Scenario: Administrador visualiza os detalhes de uma solicitação pendente
        Given que eu estou na página de "Aprovar Cadastro"
        And existe uma solicitação de cadastro pendente para "Bruno Lima"
        When eu clico em "Detalhes" ao lado do nome de "Bruno Lima"
        Then eu devo ser redirecionado para a página de "Detalhes da Solicitação"
        And eu devo ver os detalhes completos: nome "Bruno Lima",
        And tipo "Professor"
        And e-mail "bruno.lima.prof@email.com"

    Scenario: Administrador aprova uma solicitação de cadastro com sucesso
        When eu aprovo o cadastro de "Ana Souza"
        Then o cadastro de "Ana Souza" será removido da lista de pendências
        And uma notificação de sucesso "Usuário aprovado com sucesso!" é exibida
        And um email de confirmação de cadastro deve ser enviado para "ana.souza@email.com"

    Scenario: Administrador rejeita um cadastro com uma justificativa válida
        When eu rejeito o cadastro de "Bruno Lima" com o motivo "Dados inconsistentes"
        Then o cadastro de "Bruno Lima" deve ser removido da lista de pendências
        And uma notificação de sucesso "Usuário rejeitado com sucesso!" é exibida
        And um e-mail de rejeição com o motivo "Dados inconsistentes" deve ser enviado para "<bruno.limma.prof@gmail.com>"

    Scenario: Tentativa de rejeitar um cadastro sem informar a justificativa
        When eu tento rejeitar o cadastro de "Carla Dias" sem preencher o motivo
        Then uma mensagem de erro "O motivo da rejeição é obrigatório." deve ser exibida
        And a lista de pendências permanece inalterada

    Scenario: Visualização da tela sem nenhuma solicitação pendente
        Given que eu sou um administrador e não há solicitações de cadastro pendentes
        When eu acesso a página de "Aprovar Cadastro"
        Then eu devo ver a mensagem "Nenhuma solicitação pendente no momento."
        And nenhuma solicitação é exibida
