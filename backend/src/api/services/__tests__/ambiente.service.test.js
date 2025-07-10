
import { beforeEach, describe, expect, jest, test } from '@jest/globals';


jest.unstable_mockModule('../../models/ambiente.model.js', () => ({
    default: {
        findByIdentificador: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
    },
}));

jest.unstable_mockModule('../../models/reserva.model.js', () => ({
    default: {
        findFutureByResourceId: jest.fn(),
    },
}));


describe('AmbienteService', () => {
    // Definimos as variáveis aqui, mas elas serão preenchidas depois.
    let AmbienteService;
    let AmbienteModel;
    let ReservaModel;

    // O beforeEach agora é assíncrono para podermos usar o import() dinâmico.
    beforeEach(async () => {
        AmbienteService = (await import('../ambiente.service.js')).default;
        AmbienteModel = (await import('../../models/ambiente.model.js')).default;
        ReservaModel = (await import('../../models/reserva.model.js')).default;
        
        jest.clearAllMocks();
    });

    // Os seus testes individuais continuam exatamente iguais!
    test('deve criar um ambiente com sucesso quando os dados são válidos', async () => {
        const dadosNovoAmbiente = { tipo: 'Laboratório', identificacao: 'Lab 2' };
        AmbienteModel.findByIdentificador.mockResolvedValue(null);
        AmbienteModel.create.mockResolvedValue({ id: 1, ...dadosNovoAmbiente });

        const resultado = await AmbienteService.create(dadosNovoAmbiente);

        expect(resultado).toBeDefined();
        expect(resultado.identificacao).toBe('Lab 2');
        expect(AmbienteModel.create).toHaveBeenCalledWith(dadosNovoAmbiente);
    });

    test('deve lançar um erro ao tentar criar um ambiente com identificador duplicado', async () => {
        const dadosAmbienteDuplicado = { tipo: 'Laboratório', identificacao: 'Lab 2' };
        AmbienteModel.findByIdentificador.mockResolvedValue({ id: 1, identificacao: 'Lab 2' });
        
        await expect(AmbienteService.create(dadosAmbienteDuplicado))
            .rejects
            .toThrow('Identificador já cadastrado');
    });
    
    // ...seus outros testes para 'sem identificador' e para 'delete' continuam aqui...
    test('deve lançar um erro ao tentar deletar um ambiente que possui reservas futuras', async () => {
        const ambienteId = 1;
        ReservaModel.findFutureByResourceId.mockResolvedValue([{ id: 100, data_inicio: '2025-10-10' }]);

        await expect(AmbienteService.delete(ambienteId))
            .rejects
            .toThrow('Não é possível excluir um espaço com reservas futuras');
    });
});