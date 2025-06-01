Feature: pagina inicial do administrador

    As administrador do sistema
    Scenario: Administrador realiza login com sucesso
        When o administrador faz login no sistema
        Then ele é redirecionado para a página inicial
        And as seguintes funcionalidades estão visíveis:
            | Solicitações de cadastro     |
            | Excluir cadastro             |
            | Histórico de reservas        |
            | Área com espaços cadastrados |
            | Perfil                       |
            | Log out                      |

    Scenario: Página inicial com solicitações de cadastro pendentes
        Given o administrador acessa a página inicial
        When existem solicitações de cadastro pendentes
        Then um indicador visual (ex: badge vermelho) aparece ao lado da opção "Solicitações de cadastro"

    Scenario: Espaços com solicitações de reserva pendentes são destacados
        Given existem solicitações pendentes para determinados espaços
        Then os botões correspondentes aos espaços são destacados visualmente

    Scenario: Página inicial com solicitações de reserva pendentes
        Given o administrador acessa a página inicial
        When há uma solicitação de reserva pendente para a sala "Sala 1"
        Then um indicador visual aparece ao lado da sala "Sala 1"

    Scenario: Página inicial sem pendências visuais
        Given o administrador acessa a página inicial
        When não há solicitações de cadastro ou reserva pendentes
        Then nenhum indicador visual é exibido

    Scenario: Administrador acessa o formulário de adição de espaço
        When o administrador clica em "Adicionar"
        Then é redirecionado para a página de cadastro de novo espaço

    Scenario: Administrador acessa a gestão de um espaço
        When o administrador clica em "Lab 1"
        Then é redirecionado para a página de gerenciamento do laboratório "Lab 1"

    Scenario: Administrador realiza logout
        When o administrador clica em "Log out (Sair)"
        Then ele é redirecionado para a tela de login
