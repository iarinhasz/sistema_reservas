Feature: gerenciamento de perfil do administrador

	As administrador do sistema
	I want to visualizar e editar meus dados cadastrais
	So that minhas informações estejam sempre atualizadas e seguras.
	
	Scenario: Administrador visualiza seus dados de perfil
	    Given o administrador está logado no sistema
	    And clica no botão/link "Perfil" no cabeçalho
	    Then ele é redirecionado para a página de "Meu Perfil"
	    And visualiza seus dados cadastrais:
	        | Campo             | Valor                  |
	        | Nome Completo     | João Administrador     |
	        | Email             | joao.adm@dominio.com   |
	        | Identificador ADM | ADM001                 |
	    And os botões "Editar Dados" e "Alterar Senha" estão visíveis.
	
	Scenario: Administrador edita seus dados de perfil com sucesso
	    Given o administrador está na página "Meu Perfil"
	    And clica no botão "Editar Dados"
	    Then os campos "Nome Completo" e "Email" se tornam editáveis
	    And o botão "Salvar Alterações" e "Cancelar" ficam visíveis.
	    When o administrador altera o campo "Nome Completo" para "João Administrador Silva"
	    And clica no botão "Salvar Alterações"
	    Then uma mensagem de sucesso "Dados atualizados com sucesso!" é exibida
	    And o "Nome Completo" na página é atualizado para "João Administrador Silva".
	
	Scenario: Administrador tenta editar dados com informação inválida
	    Given o administrador está editando seus dados de perfil
	    When o administrador altera o campo "Email" para "joao.invalido"
	    And clica no botão "Salvar Alterações"
	    Then uma mensagem de erro "Formato de email inválido." é exibida
	    And os dados não são salvos
	    And o administrador permanece na tela de edição.
	
	Scenario: Administrador cancela a edição de dados do perfil
	    Given o administrador está editando seus dados de perfil
	    And alterou o campo "Nome Completo" para "João Admin Teste"
	    When clica no botão "Cancelar"
	    Then as alterações são descartadas
	    And o "Nome Completo" volta a ser exibido como "João Administrador"
	    And o administrador retorna à visualização do perfil (campos não editáveis).
	
	Scenario: Administrador acessa a funcionalidade de alterar senha
	    Given o administrador está na página "Meu Perfil"
	    When clica no botão "Alterar Senha"
	    Then é redirecionado para a página/modal de "Alteração de Senha"
	    And visualiza os campos "Senha Atual", "Nova Senha", "Confirmar Nova Senha"
	    And os botões "Salvar Nova Senha" e "Cancelar" estão visíveis.
	
	Scenario: Administrador altera a senha com sucesso
	    Given o administrador está na página de "Alteração de Senha"
	    When preenche o campo "Senha Atual" com sua senha correta
	    And preenche o campo "Nova Senha" com "NovaSenha@123"
	    And preenche o campo "Confirmar Nova Senha" com "NovaSenha@123"
	    And clica no botão "Salvar Nova Senha"
	    Then uma mensagem de sucesso "Senha alterada com sucesso!" é exibida
	    And o administrador é redirecionado para a página "Meu Perfil" (ou para a página de login para reautenticação).
	
	Scenario: Administrador tenta alterar a senha com senhas novas não coincidentes
	    Given o administrador está na página de "Alteração de Senha"
	    When preenche o campo "Senha Atual" com sua senha correta
	    And preenche o campo "Nova Senha" com "NovaSenha@123"
	    And preenche o campo "Confirmar Nova Senha" com "OutraSenha@123"
	    And clica no botão "Salvar Nova Senha"
	    Then uma mensagem de erro "A nova senha e a confirmação não coincidem." é exibida
	    And a senha não é alterada.
	
	Scenario: Administrador tenta alterar a senha com senha atual incorreta
	    Given o administrador está na página de "Alteração de Senha"
	    When preenche o campo "Senha Atual" com uma senha incorreta
	    And preenche os campos "Nova Senha" e "Confirmar Nova Senha" corretamente
	    And clica no botão "Salvar Nova Senha"
	    Then uma mensagem de erro "Senha atual incorreta." é exibida
	    And a senha não é alterada.
