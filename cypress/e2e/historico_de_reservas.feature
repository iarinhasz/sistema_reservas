Feature: Histórico e filtragem de reservas

		As administrador do sistema
		I want to visualizar, pesquisar e filtrar o histórico de todas as reservas
		So that eu possa gerenciar e auditar o uso dos espaços eficientemente.

		Scenario: Administrador acessa o histórico de reservas
		    Given o administrador está logado no sistema
		    And clica no link/botão "Histórico de Reservas"
		    Then ele é redirecionado para a página "Histórico de Reservas"
		    And uma tabela de reservas é exibida contendo as colunas: "Nome do Solicitante", "Tipo de Recurso", "Nome do Recurso", "Data e Horários", "Status", "Ações".
		    And os campos de filtro ("Nome do Solicitante", "Login do Solicitante", "Tipo de Recurso", "Nome do Recurso", "Status", "Período") estão visíveis.
		
		Scenario: Administrador filtra reservas por nome do solicitante
		    Given o administrador está na página "Histórico de Reservas"
		    And existem reservas feitas por "Carlos Pereira"
		    When o administrador digita "Carlos Pereira" no campo de filtro "Nome do Solicitante"
		    And clica no botão "Filtrar" (ou o filtro é aplicado automaticamente)
		    Then a tabela de reservas exibe apenas as reservas solicitadas por "Carlos Pereira".
		
		Scenario: Administrador filtra reservas por status "Pendente"
		    Given o administrador está na página "Histórico de Reservas"
		    And existem reservas com status "Pendente"
		    When o administrador seleciona "Pendente" no filtro "Status"
		    And clica no botão "Filtrar"
		    Then a tabela de reservas exibe apenas as reservas com status "Pendente".
		
		Scenario: Administrador filtra reservas por período específico
		    Given o administrador está na página "Histórico de Reservas"
		    And existem reservas entre "01/07/2025" e "15/07/2025"
		    When o administrador seleciona "01/07/2025" como data de início no filtro "Período"
		    And seleciona "15/07/2025" como data de fim no filtro "Período"
		    And clica no botão "Filtrar"
		    Then a tabela de reservas exibe apenas as reservas dentro do período selecionado.
		
		Scenario: Administrador visualiza detalhes de uma reserva específica
		    Given o administrador está na página "Histórico de Reservas"
		    And existe uma reserva para "Sala A01" por "Ana Beatriz" com status "Aprovada"
		    When o administrador clica no botão "Ver Detalhes" da reserva de "Ana Beatriz" para a "Sala A01"
		    Then um modal ou seção é exibido com os seguintes detalhes:
		        | Campo                   | Valor Exemplo                                     |
		        | ----------------------- | ------------------------------------------------- |
		        | Nome do Solicitante     | Ana Beatriz                                       |
		        | Email do Solicitante    | ana.beatriz@email.com                             |
		        | Tipo de Recurso         | Sala                                              |
		        | Nome do Recurso         | Sala A01                                          |
		        | Data e Horários         | 10/07/2025 - 14:00 às 16:00                       |
		        | Status                  | Aprovada                                          |
		        | Justificativa de Uso    | Reunião de grupo de estudos                       |
		        | Equipamentos Solicitados| Projetor, Quadro Branco                           |
		        | Histórico de Ações      | Solicitada: 08/07/2025; Aprovada: 09/07/2025 (ADM) |
		
		Scenario: Administrador não encontra reservas após aplicar filtros
		    Given o administrador está na página "Histórico de Reservas"
		    When o administrador aplica um filtro para "Nome do Solicitante" = "Usuário Inexistente"
		    And clica no botão "Filtrar"
		    Then a tabela de reservas fica vazia
		    And uma mensagem "Nenhuma reserva encontrada para os filtros aplicados." é exibida.
		
		Scenario: Limpar filtros aplicados no histórico de reservas
		    Given o administrador está na página "Histórico de Reservas"
		    And aplicou filtros que resultaram em uma lista reduzida de reservas
		    When o administrador clica no botão "Limpar Filtros"
		    Then todos os campos de filtro são resetados para seus valores padrão
		    And a tabela de reservas volta a exibir todas as reservas (ou a paginação inicial).
