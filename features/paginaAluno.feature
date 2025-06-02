Feature: Pagina inicial de aluno

    As aluno
    Scenario: Aluno realiza login
        When o aluno realiza login
        Then o mesmo e redirecionada para a paginal de aluno
        And as seguintes funcionalidades estao visiveis
        | Perfil                       |
        | Log out                      |
        | Salas cadastradas            |

    Scenario: Aluno acessa a pagina de aluno sem salas cadastradas
        When o aluno acessa a pagina de aluno
        And nao ha salas cadastradas no sistema
        Then uma mensagem e exibida informando que nao ha salas cadastradas no sistema
        And nenhuma opcao de sala e exibida na interface
    
    Scenario: Aluno acessa a pagina de agendamento da Sala 1
        When o aluno clica no botao Sala 1
        Then ele e redirecionado para a pagina de agendamento da Sala 1
        And as informacoes da sala sao exibidas, incluindo
        | Seletor de recursos                 |
        | Calendario com horarios agendados   |
        | Campo de selecao de data            |
        | Campo de horario inicial            |
        | Campo de horario final              |
        | Botao "Solicitar Reserva"           |

    Scenario: Aluno reserva o recurso A da Sala 1
        When o aluno acessa a pagina de agendamento da Sala 1
        And seleciona um recurso A
        And seleciona um horario livre
        Then o sistema exibe uma mensagem informando que o horario esta disponavel
        And o aluno consegue concluir a solicitacao de reserva

    Scenario: Aluno tenta reservar o recurso A da Sala 1 em um horario ja ocupado
        When o aluno acessa a pagina de agendamento da Sala 1
        And seleciona um recurso A
        And seleciona um horario que ja esta reservado
        Then o sistema exibe uma mensagem informando que o horario esta indisponivel
        And o aluno nao consegue concluir a solicitacao de reserva

    Scenario: Aluno realiza logout
        When o aluno clica em "Sair"
        Then ele e redirecionado para a tela de login

    Scenario: Aluno acessa a pagina de Perfil
        When o aluno clica em "Perfil"
        Then ele e redirecionado para a tela de Perfil
        And certas informacoes estao disponiveis como
        | Foto de perfil            |
        | Nome                      |
        | Bio                       |

