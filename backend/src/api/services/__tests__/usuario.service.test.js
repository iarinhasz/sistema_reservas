import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.unstable_mockModule('../../models/usuario.model.js', () => ({
    default: {
        updateStatus: jest.fn(),
        findPending: jest.fn(),
        findByCpf: jest.fn(),
        deleteByCpf: jest.fn(),
    },
}));

jest.unstable_mockModule('../email.service.js', () => ({
    default: {
        sendApprovalEmail: jest.fn(),
        sendRejectionEmail: jest.fn(),
    },
}));


describe('UsuarioService', () => {
    let UsuarioService;
    let UsuarioModel;
    let EmailService;

    beforeEach(async () => {
        // Carregamos os módulos dinamicamente após a definição dos mocks
        UsuarioService = (await import('../usuario.service.js')).default;
        UsuarioModel = (await import('../../models/usuario.model.js')).default;
        EmailService = (await import('../email.service.js')).default;
        
        jest.clearAllMocks();
    });

    describe('Aprovar Cadastro', () => {
        test('deve aprovar um usuário e enviar um e-mail de confirmação', async () => {
            // Arrange (Preparação)
            const usuarioPendente = { cpf: '11122233344', nome: 'Ana Souza', email: 'ana.souza@email.com' };
            // Simulamos que o model atualizou o status com sucesso
            UsuarioModel.updateStatus.mockResolvedValue({ ...usuarioPendente, status: 'ativo' });

            // Act (Ação)
            const resultado = await UsuarioService.aprovarCadastro(usuarioPendente.cpf);

            // Assert (Verificação)
            expect(UsuarioModel.updateStatus).toHaveBeenCalledWith(usuarioPendente.cpf, 'ativo');
            expect(EmailService.sendApprovalEmail).toHaveBeenCalledWith(resultado);
            expect(resultado.status).toBe('ativo');
        });
    });

    // --- Testes para a função rejeitarCadastro ---
    describe('Rejeitar Cadastro', () => {
        test('deve rejeitar um usuário com justificativa e enviar um e-mail de notificação', async () => {
            // Arrange
            const usuarioPendente = { cpf: '44455566677', nome: 'Bruno Lima', email: 'bruno.lima.prof@email.com' };
            const justificativa = 'Dados inconsistentes';
            // Simulamos que o model encontrou o usuário
            UsuarioModel.findByCpf.mockResolvedValue(usuarioPendente);

            // Act
            await UsuarioService.rejeitarCadastro(usuarioPendente.cpf, justificativa);

            // Assert
            expect(UsuarioModel.deleteByCpf).toHaveBeenCalledWith(usuarioPendente.cpf);
            expect(EmailService.sendRejectionEmail).toHaveBeenCalledWith(usuarioPendente, justificativa);
        });

        test('deve lançar um erro ao tentar rejeitar um cadastro sem justificativa', async () => {
            // Arrange
            const cpfUsuario = '123456';
            const justificativa = undefined; // ou null, ou ''

            // Act & Assert
            await expect(UsuarioService.rejeitarCadastro(cpfUsuario, justificativa))
                .rejects
                .toThrow('O motivo da rejeição é obrigatório.');
            
            // Garante que nenhuma ação foi tomada
            expect(UsuarioModel.deleteByCpf).not.toHaveBeenCalled();
            expect(EmailService.sendRejectionEmail).not.toHaveBeenCalled();
        });
    });

    // --- Teste para a função listarPendentes ---
    describe('Listar Pendentes', () => {
        test('deve retornar a lista de usuários pendentes fornecida pelo model', async () => {
            // Arrange
            const listaDePendentes = [{ nome: 'Ana Souza' }, { nome: 'Bruno Lima' }];
            UsuarioModel.findPending.mockResolvedValue(listaDePendentes);

            // Act
            const resultado = await UsuarioService.listarPendentes();

            // Assert
            expect(resultado).toEqual(listaDePendentes);
            expect(UsuarioModel.findPending).toHaveBeenCalledTimes(1);
        });
    });
});