Feature: Página Inicial do Professor

    As professor
    I want to acessar a interface principal
    So that o professor gerencia as suas funcionalidades

    Background:
        Given o usuário "professor123" está cadastradi no banco de dados como professor

    Scenario: Professor realiza login
        When o professor fornece as credenciais de login: usuário "professor123" e senha "senha123"
        Then o sistema valida que o usuário existe e o perfil é de professor
        And o professor é direcionado para a interface principal
        And uma nova sessão é iniciada com segurança
        And o professor deve visualizar as seguintes funcionalidade:
            | Perfil                   |
            | Sair                     |   
            | Gerenciamento de Reserva |
            | Cadastro de Salas        |
    
    Scenario: Professor tenta acessar o sistema com senha incorreta
        When o professor fornece o login "professor123" e uma senha incorreta "senha321" 
        Then o sistema deve exibir uma mensagem de erro indicando "Usuário ou senha inválidos"
        And o professor deve permanecer na tela de login
        And nenhuma funcionalidade da interface principal é exibida

     Scenario: Professor encerra a sessão
         Given o professor está autenticado e na página principal
         When seleciona a opção "Sair"
         Then o sistema deve redirecioná-lo para a tela de login
         And a sessão é encerrada