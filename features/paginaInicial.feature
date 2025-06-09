Feature: Pagina iInicial do administrador

    Como administrador do sistema
    Eu quero acessar as funcionalidades de gerenciamento em uma página inicial
    Para que eu possa gerenciar cadastros de usuários, reservas e espaços de forma centralizada
    
    Background:
        Sou administrador autenticado no sistema

    Scenario: Administrador realiza login com sucesso
        Given estou na tela de login
        And preencho o campo de nome com "fulaninho"
        And preencho o campo de senha com "123fulaninh0"
        When clico no botão "Entrar"
        Then sou redirecionado para a pagina inicial
        And as seguintes funcionalidades estão visíveis:
            | Solicitações de cadastro     |
            | Adicionar espaço             |
            | Histórico de reservas        |
            | Área com espaços cadastrados |
            | Perfil                       |
            | Sair                         |

    Scenario: Administrador acessa seu perfil pela página inicial
        When eu clico na opção "Perfil"
        Then sou redirecionado para a página do meu perfil
        And vejo o nome completo "Luan da Silva"
        And CPF "123.456.789-00"
        And e-mail "luan.silva@email.com"
        And tipo de cadastro "Administrador"
        And número de telefone "(81) 91234-5678"

    Scenario: "Página Inicial" sem pendências
        Given não existem solicitações de cadastro ou reservas pendentes
        When eu acesso a "Página Inicial"
        Then não há destaque em "Solicitações de cadastro"
        And "Espaço Cadastrado"

    Scenario: Destaque para solicitações de cadastro pendentes
        Given existem solicitações de cadastro de usuários pendentes
        When eu acesso a página inicial
        Then a opção "Solicitações de cadastro" deve ser exibida com destaque

    Scenario: Destaque para solicitações de reservas de espaço pendentes
        Given o espaço "<Lab 2>" possui solicitações de reservas pendentes
        When eu acesso a "Página Inicial"
        Then o espaço "<Lab 2>" deve ser exibido com destaque

    Scenario: Administrador realiza logout do sistema
        When eu clico em "Sair"
        Then eu sou redirecionado para a tela de login
        And minha sessão é encerrada
