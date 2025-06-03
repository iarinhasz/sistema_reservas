Feature: Pagina inicial de aluno

    As aluno
    Scenario: Aluno realiza login
        Given que o usuario "Aluno123" com a senha "senha123" esta registrado no banco de dados como um aluno
        When o aluno entra o login "Aluno123" e a senha "senha123"
        And e checado que esse usuario esta registrado no banco de dados
        And e checado que esse usuario e um aluno
        Then o mesmo e redirecionado para a pagina de aluno
        And as seguintes funcionalidades estao visiveis
        | Perfil                       |
        | Log out                      |
        | Salas cadastradas            |

    Scenario: Aluno acessa a pagina de aluno sem salas cadastradas
        Given que o aluno esta logado no sistema
        And que nao ha salas cadastradas no sistema
        When o aluno acessa a pagina de aluno
        Then uma mensagem e exibida informando que nao ha salas cadastradas no sistema
        And nenhuma opcao de sala e exibida na interface
    
    Scenario: Aluno acessa a pagina de agendamento da Sala 1
        Given que o aluno esta logado no sistema
        And que a "Sala 1" esta cadastrada
        When o aluno clica no botao "Sala 1"
        Then ele e redirecionado para a pagina de agendamento da "Sala 1"
        And as informacoes da sala sao exibidas, incluindo
        | Seletor de recursos                 |
        | Calendario com horarios agendados   |
        | Campo de selecao de data            |
        | Campo de horario inicial            |
        | Campo de horario final              |
        | Botao "Solicitar Reserva"           |

    Scenario: Aluno reserva o Recurso A da Sala 1
        Given que o aluno esta na pagina de agendamento da "Sala 1"
        And que o "Recurso A" da "Sala 1" possui horarios disponiveis
        When o aluno acessa a pagina de agendamento da Sala 1
        And seleciona o "Recurso A"
        And seleciona um horario livre
        Then o sistema exibe uma mensagem informando que o horario esta disponivel
        And o aluno consegue concluir a solicitacao de reserva

    Scenario: Aluno tenta reservar o recurso A da Sala 1 em um horario ja ocupado
        Given que o aluno esta na pagina de agendamento da "Sala 1"
        And que o "Recurso A" da "Sala 1" tem um horario especifico ja reservado
        When o aluno acessa a pagina de agendamento da Sala 1
        And seleciona o "Recurso A"
        And seleciona um horario que ja esta reservado
        Then o sistema exibe uma mensagem informando que o horario esta indisponivel
        And o aluno nao consegue concluir a solicitacao de reserva

    Scenario: Aluno realiza logout
        Given que o aluno esta logado no sistema
        And esta na pagina de aluno
        When o aluno clica em "Sair"
        Then ele e redirecionado para a tela de login

    Scenario: Aluno acessa a pagina de Perfil
        Given que o aluno esta logado no sistema
        And esta na pagina de aluno
        When o aluno clica em "Perfil"
        Then ele e redirecionado para a tela de Perfil
        And certas informacoes estao disponiveis, como
        | Foto de perfil            |
        | Nome                      |
        | Bio                       |

