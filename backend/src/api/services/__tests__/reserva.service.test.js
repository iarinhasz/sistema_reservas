import { beforeEach, describe, expect, jest, test } from '@jest/globals';

jest.unstable_mockModule('../../models/reserva.model.js', () => ({
    default: {
        create: jest.fn(),
        checkAvailability: jest.fn(),
        updateStatus: jest.fn(),
        rejectConflictsFor: jest.fn(),
        findById: jest.fn(),
    },
}));

describe('ReservaService', () => {
    let ReservaService;
    let ReservaModel;

    beforeEach(async () => {
        ReservaService = (await import('../reserva.service.js')).default;
        ReservaModel = (await import('../../models/reserva.model.js')).default;
        jest.clearAllMocks();
    });

    describe('solicitar', () => {
        test('deve criar uma solicitação de reserva com sucesso', async () => {
            const dadosUsuario = { cpf: '11122233344', tipo: 'professor' };
            const dadosSolicitacao = { recurso_id: 1, recurso_tipo: 'ambiente', data_inicio: '2025-10-10T10:00:00Z', data_fim: '2025-10-10T11:00:00Z', titulo: 'Aula' };
            
            ReservaModel.checkAvailability.mockResolvedValue(false);
            ReservaModel.create.mockResolvedValue({ id: 1, status: 'pendente', ...dadosSolicitacao });

            const resultado = await ReservaService.solicitar(dadosSolicitacao, dadosUsuario);

            expect(resultado).toBeDefined();
            expect(resultado.status).toBe('pendente');
            expect(ReservaModel.create).toHaveBeenCalledTimes(1);
        });

        test('deve lançar um erro se um aluno tentar reservar um ambiente', async () => {
            const dadosUsuario = { cpf: '55566677788', tipo: 'aluno' };
            const dadosSolicitacao = { recurso_id: 1, recurso_tipo: 'ambiente' };

            await expect(ReservaService.solicitar(dadosSolicitacao, dadosUsuario))
                .rejects
                .toThrow('Acesso proibido. Alunos podem reservar apenas equipamentos.');
        });

        test('deve lançar um erro ao solicitar reserva em um horário já ocupado', async () => {
            const dadosUsuario = { cpf: '11122233344', tipo: 'professor' };
            const dadosSolicitacao = { recurso_id: 1, recurso_tipo: 'ambiente' };
            
            ReservaModel.checkAvailability.mockResolvedValue(true);

            await expect(ReservaService.solicitar(dadosSolicitacao, dadosUsuario))
                .rejects
                .toThrow('Conflito: Já existe uma reserva aprovada para este recurso no horário solicitado.');
        });
    });

    describe('aprovar', () => {
        test('deve aprovar uma reserva com sucesso', async () => {
            const reservaId = 1;
            const reservaPendente = { id: reservaId, status: 'pendente' };
            
            ReservaModel.findById.mockResolvedValue(reservaPendente);
            ReservaModel.checkAvailability.mockResolvedValue(false);
            ReservaModel.updateStatus.mockResolvedValue({ ...reservaPendente, status: 'aprovada' });
            ReservaModel.rejectConflictsFor.mockResolvedValue(0);

            const resultado = await ReservaService.aprovar(reservaId);

            expect(resultado.status).toBe('aprovada');
            expect(ReservaModel.updateStatus).toHaveBeenCalledWith(reservaId, 'aprovada');
        });
    });
});