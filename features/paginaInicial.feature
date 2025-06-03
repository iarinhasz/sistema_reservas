Feature: pagina inicial do administrador

    As administrador do sistema
    I want to acessar funcionalidades exclusivas da administração
    So that eu possa gerenciar usuários, reservas e espaços do sistema
    
    Scenario: Administrador realiza login com sucesso
        Given estou na tela de login
        And preencho o campo de nome com "fulaninho"
        And preencho o campo de senha com "123fulaninh0"
        When clico no botão "Entrar"
        Then sou redirecionado para a página inicial
        And as seguintes funcionalidades estão visíveis:
            | Solicitações de cadastro     |
            | Excluir cadastro             |
            | Histórico de reservas        |
            | Área com espaços cadastrados |
            | Perfil                       |
            | Log out                      |

    Scenario: Usuário não administrador tenta acessar a área administrativa
        Given estou na tela de login
        And preencho o campo de nome com "usuario123"
        And preencho o campo de senha com "senha123"
        When clico no botão "Entrar"
        Then vejo uma mensagem de erro "Acesso negado"
        And continuo na tela de login

    Scenario: Página inicial com solicitações de cadastro pendentes
        Given estou logado como administrador
        And acesso a página inicial
        And existem solicitações de cadastro pendentes
        Then um indicador visual (ex: badge vermelho) aparece ao lado da opção "Solicitações de cadastro"

    Scenario: Espaços com solicitações de reserva pendentes são destacados
        Given estou logado como administrador
        And existem solicitações pendentes para determinados espaços
        Then os botões correspondentes aos espaços são destacados visualmente
    
    Scenario: Página inicial com solicitações de reserva pendentes
        Given estou logado como administrador
        And acesso a página inicial
        And há uma solicitação de reserva pendente para a sala "Sala 1"
        Then um indicador visual aparece ao lado da sala "Sala 1"

    Scenario: Página inicial sem pendências visuais
        Given estou logado como administrador
        And acesso a página inicial
        And não há solicitações de cadastro ou reserva pendentes
        Then nenhum indicador visual é exibido

    Scenario: Administrador acessa o formulário de adição de espaço
        Given estou logado como administrador
        When clico em "Adicionar"
        Then sou redirecionado para a página de cadastro de novo espaço
    
    Scenario: Administrador acessa a gestão de um espaço
        Given estou logado como administrador
        When clico em "Lab 1"
        Then sou redirecionado para a página de gerenciamento do laboratório "Lab 1"

    Scenario: Administrador realiza logout
        Given estou logado como administrador
        When clico em "Log out (Sair)"
        Then sou redirecionado para a tela de login
